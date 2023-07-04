import { OpKind } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { unknownToError } from 'errors/error'
import { estimateBatchOperation, estimateExecution } from 'errors/helpers/walletError.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { MVK_TOKEN_SYMBOL } from 'utils/constants'

export const stakeMVK = async (
  amount: number,
  accountPkh: string,
  doormanAddress: string,
  mvkTokenAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const mvkTokenContract = await tezos?.wallet.at(mvkTokenAddress)
    const doormanContract = await tezos?.wallet.at(doormanAddress)

    const approveBatchItemMetaData = {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...mvkTokenContract.methods
        .update_operators([
          {
            add_operator: {
              owner: accountPkh,
              operator: doormanAddress,
              token_id: 0,
            },
          },
        ])
        .toTransferParams(),
    }

    const removeBatchItemMetaData = {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...mvkTokenContract.methods
        .update_operators([
          {
            remove_operator: {
              owner: accountPkh,
              operator: doormanAddress,
              token_id: 0,
            },
          },
        ])
        .toTransferParams(),
    }

    const stakeBatchItemMetaData = {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...doormanContract.methods.stake(convertNumberForContractCall({ number: amount })).toTransferParams(),
    }

    const batchArr = [approveBatchItemMetaData, stakeBatchItemMetaData, removeBatchItemMetaData]

    // Estimating Operations for the batch call
    const estimateBatchOp = await estimateBatchOperation(batchArr)

    if (estimateBatchOp.error) {
      return { actionSuccess: false, error: estimateBatchOp.error }
    }

    const operation = await tezos.wallet.batch(batchArr).send()

    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

export const unstakeMVK = async (
  amount: number,
  doormanAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(doormanAddress)
    const unstakeOperationMetaData = contract?.methods.unstake(convertNumberForContractCall({ number: amount }))
    const op = await estimateExecution(unstakeOperationMetaData)

    if (op?.error) {
      return { actionSuccess: false, error: op.error }
    }

    const operation = await unstakeOperationMetaData.send()

    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

export const rewardsCompound = async (
  userAddress: string,
  doormanAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos?.wallet.at(doormanAddress)
    const rewardsOperationMetaData = contract?.methods.compound(userAddress)
    const op = await estimateExecution(rewardsOperationMetaData)

    if (op?.error) {
      return { actionSuccess: false, error: op.error }
    }

    const operation = await rewardsOperationMetaData.send()

    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

export const getMVKTokensFromFaucet = async (mvkFaucetAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(mvkFaucetAddress)
    const requestMVKMetaData = await contract.methods.requestMvk()

    const op = await estimateExecution(requestMVKMetaData)

    if (op?.error) {
      return { actionSuccess: false, error: op.error }
    }

    const operation = await requestMVKMetaData.send()

    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

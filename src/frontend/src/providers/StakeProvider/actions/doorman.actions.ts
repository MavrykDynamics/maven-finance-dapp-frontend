import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { unknownToError } from 'errors/error'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { OpKind } from '@taquito/taquito'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'

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

    return await getEstimationBatchResult(tezos, batchArr)
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

    return await getEstimationResult(unstakeOperationMetaData)
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

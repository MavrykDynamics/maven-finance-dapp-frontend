import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { unknownToError, WalletOperationError } from 'errors/error'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { OpKind } from '@mavrykdynamics/webmavryk'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'

export const stakeMVN = async (
  amount: number,
  accountPkh: string,
  doormanAddress: string,
  mvnTokenAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const mvnTokenContract = await tezos?.wallet.at(mvnTokenAddress)
    const doormanContract = await tezos?.wallet.at(doormanAddress)

    const approveBatchItemMetaData = {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...mvnTokenContract.methods
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
      ...mvnTokenContract.methods
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
      ...doormanContract.methods.stakeMvn(convertNumberForContractCall({ number: amount })).toTransferParams(),
    }

    const batchArr = [approveBatchItemMetaData, stakeBatchItemMetaData, removeBatchItemMetaData]

    return await getEstimationBatchResult(tezos, batchArr)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const unstakeMVN = async (
  amount: number,
  doormanAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(doormanAddress)
    const unstakeOperationMetaData = contract?.methods.unstakeMvn(convertNumberForContractCall({ number: amount }))

    return await getEstimationResult(unstakeOperationMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

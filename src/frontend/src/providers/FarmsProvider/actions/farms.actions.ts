// consts
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

// utils
import { unknownToError, WalletOperationError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { buildTokenApprovalBatch } from 'providers/common/utils/tokenOperations'

// types
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { FarmsTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { OpKind } from '@mavrykdynamics/webmavryk'

export const harvestRewards = async (
  farmAddress: string,
  userAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(farmAddress)
    const harvestOperationMetaData = await contract?.methods.claim([userAddress])

    return await getEstimationResult(harvestOperationMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const depositToFarm = async (
  farmAddress: string,
  userAddress: string,
  amount: number,
  token: FarmsTokenMetadataType,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    const { decimals, type, address } = token
    const depositAmount = convertNumberForContractCall({ number: amount, grade: decimals })

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(farmAddress)

    const mainOp = {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...contract?.methods.deposit(depositAmount).toTransferParams(),
    }

    const batchOps = await buildTokenApprovalBatch({
      tezos,
      tokenType: type,
      tokenAddress: address,
      spender: farmAddress,
      owner: userAddress,
      amount: depositAmount,
      mainOps: [mainOp],
    })

    return await getEstimationBatchResult(tezos, batchOps)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const withdrawFromFarm = async (
  farmAddress: string,
  amount: number,
  token: FarmsTokenMetadataType,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    const { decimals } = token
    const withdrawAmount = convertNumberForContractCall({ number: amount, grade: decimals })

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(farmAddress)
    const withdrawOperationMetaData = await contract?.methods.withdraw(withdrawAmount)

    return await getEstimationResult(withdrawOperationMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

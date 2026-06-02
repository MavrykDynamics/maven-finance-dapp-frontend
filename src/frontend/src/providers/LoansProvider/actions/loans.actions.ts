// consts
import { OpKind } from '@mavrykdynamics/webmavryk'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

// helpers
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { buildTokenApprovalBatch } from 'providers/common/utils/tokenOperations'

// types
import { LoansTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

export const depositLendingAssetAction = async (
  userAddress: string,
  loanToken: LoansTokenMetadataType,
  addLiquidityAmount: number,
  lendingControllerAddress: string,
  callback: () => void,
) => {
  try {
    const {
      decimals,
      type,
      loanData: { indexerName },
      address,
    } = loanToken

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const convertedAssetAmount = convertNumberForContractCall({ number: addLiquidityAmount, grade: decimals })
    const contract = await tezos.wallet.at(lendingControllerAddress)

    if (type === 'mav') {
      const depositTezMetaData = contract?.methods.addLiquidity(indexerName, convertedAssetAmount)

      return await getEstimationResult(depositTezMetaData, {
        params: { amount: convertedAssetAmount, mumav: true },
        callback,
      })
    }

    // fa12 uses (amount, indexerName) param order; fa2 uses (indexerName, amount)
    const mainOp = {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...(type === 'fa12'
        ? contract?.methods.addLiquidity(convertedAssetAmount, indexerName).toTransferParams()
        : contract.methods.addLiquidity(indexerName, convertedAssetAmount).toTransferParams()),
    }

    const batchOps = await buildTokenApprovalBatch({
      tezos,
      tokenType: type,
      tokenAddress: address,
      spender: lendingControllerAddress,
      owner: userAddress,
      amount: convertedAssetAmount,
      mainOps: [mainOp],
    })

    return await getEstimationBatchResult(tezos, batchOps, callback)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const withdrawLendingAssetAction = async (
  lendingControllerAddress: string,
  removeLiquidityAmount: number,
  loanToken: LoansTokenMetadataType,
  callback: () => void,
) => {
  try {
    const {
      decimals,
      loanData: { indexerName },
    } = loanToken
    // prepare and send transaction
    const convertedAssetAmount = convertNumberForContractCall({ number: removeLiquidityAmount, grade: decimals })
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(lendingControllerAddress)
    const withdrawLendingAssetMetaData = contract?.methods.removeLiquidity(indexerName, convertedAssetAmount)

    return await getEstimationResult(withdrawLendingAssetMetaData, { callback })
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

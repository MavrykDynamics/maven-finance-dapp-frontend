import { OpKind } from '@mavrykdynamics/webmavryk'
import { unknownToError, WalletOperationError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { LoansTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { convertNumberForContractCall } from 'utils/calcFunctions'

export const markForLiquidation = async (
  vaultId: number,
  vaultOwner: string,
  lendingControllerAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(lendingControllerAddress)
    const markVaultForLiquidationMetadata = contract?.methods.markForLiquidation(vaultId, vaultOwner)

    return await getEstimationResult(markVaultForLiquidationMetadata)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const liquidateVault = async (
  vaultId: number,
  vaultAddress: string,
  userAddress: string,
  vaultOwner: string,
  liquidateAmount: number,
  vaultToken: LoansTokenMetadataType,
  lendingControllerAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    const convertedLiquidateAmount = convertNumberForContractCall({
      number: liquidateAmount,
      grade: vaultToken.decimals,
    })

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(lendingControllerAddress)
    const liquidateVaultMetadata = contract?.methods.liquidateVault(vaultId, vaultOwner, convertedLiquidateAmount)

    if (vaultToken.type === 'fa12') {
      const assetContract = await tezos.wallet.at(vaultToken.address)
      const batchArr = []

      batchArr.push({
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...assetContract.methods.approve(vaultAddress, 0).toTransferParams(),
      })
      batchArr.push({
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...assetContract.methods.approve(vaultAddress, convertedLiquidateAmount).toTransferParams(),
      })
      batchArr.push({
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...contract?.methods.liquidateVault(vaultId, vaultOwner, convertedLiquidateAmount).toTransferParams(),
      })

      return await getEstimationBatchResult(tezos, batchArr)
    }

    if (vaultToken.type === 'fa2') {
      const assetContract = await tezos.wallet.at(vaultToken.address)
      const batchArr = []

      batchArr.push({
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...assetContract.methods
          .update_operators([
            {
              add_operator: {
                owner: userAddress,
                operator: lendingControllerAddress,
                token_id: 0,
              },
            },
          ])
          .toTransferParams(),
      })
      batchArr.push({
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...contract?.methods.liquidateVault(vaultId, vaultOwner, convertedLiquidateAmount).toTransferParams(),
      })
      batchArr.push({
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...assetContract.methods
          .update_operators([
            {
              remove_operator: {
                owner: userAddress,
                operator: lendingControllerAddress,
                token_id: 0,
              },
            },
          ])
          .toTransferParams(),
      })

      return await getEstimationBatchResult(tezos, batchArr)
    }

    return await getEstimationResult(liquidateVaultMetadata)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

/**
 * method for dev env and testing purposes, to change mock time for liquidation testing
 */
// export const mockLendingControllerBlockLevel = async (
//   lvlToSet: number,
//   lendingControllerAddress: string,
// ): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
//   try {
//     // prepare and send transaction
//     const tezos = await DAPP_INSTANCE.tezos()
//     const contract = await tezos.wallet.at(lendingControllerAddress)
//     const changeLevelMetadata = await contract.methods.updateConfig(lvlToSet, 'configMockLevel')

//     return await getEstimationResult(changeLevelMetadata)
//   } catch (error) {
//     const e = unknownToError(error)
//     return { actionSuccess: false, error: new WalletOperationError(e) }
//   }
// }

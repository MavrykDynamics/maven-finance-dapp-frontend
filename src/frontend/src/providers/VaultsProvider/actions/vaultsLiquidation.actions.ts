import { unknownToError, WalletOperationError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
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

    return await getEstimationResult(liquidateVaultMetadata)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

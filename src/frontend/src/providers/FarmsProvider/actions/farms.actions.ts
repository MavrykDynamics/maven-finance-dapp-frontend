// consts
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

// utils
import { unknownToError, WalletOperationError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'

// types
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { FarmsTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

export const harvestRewards = async (farmAddress: string): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(farmAddress)
    const harvestOperationMetaData = await contract?.methods.claim(farmAddress)

    return await getEstimationResult(harvestOperationMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const depositToFarm = async (
  farmAddress: string,
  amount: number,
  token: FarmsTokenMetadataType,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    const { decimals } = token
    const depositAmount = convertNumberForContractCall({ number: amount, grade: decimals })

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(farmAddress)
    const depositOperationMetaData = await contract?.methods.deposit(depositAmount)

    return await getEstimationResult(depositOperationMetaData)
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

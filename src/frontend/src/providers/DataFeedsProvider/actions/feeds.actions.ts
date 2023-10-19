// consts
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

// utils
import { unknownToError, WalletOperationError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { convertNumberForContractCall } from 'utils/calcFunctions'

// types
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'

// TODO: implement when we will be able to
export const registerFeedAction = async (): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    // const contract = await tezos.wallet.at()
    // const unstakeOperationMetaData = contract?.methods

    // return await getEstimationResult(unstakeOperationMetaData)
    return { actionSuccess: true, operation: null as any }
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

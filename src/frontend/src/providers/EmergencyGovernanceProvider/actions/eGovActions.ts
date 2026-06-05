import { unknownToError, WalletOperationError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

export const submitEGovProposal = async (
  eGovAddress: string,
  title: string,
  descr: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(eGovAddress)

    // Read the anti-spam fee directly from contract storage — cannot be bypassed by the caller
    const storage = await contract.storage<{ required_fee_mumav: { toNumber: () => number } }>()
    const feeMutez = storage.required_fee_mumav.toNumber()

    const delegateMetaData = await contract?.methods.triggerEmergencyControl(title, descr)

    return await getEstimationResult(delegateMetaData, { params: { amount: feeMutez } })
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const voteForEGovProposal = async (
  eGovAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(eGovAddress)
    const eGovVoteMetaData = await contract?.methods.voteForEmergencyControl()

    return await getEstimationResult(eGovVoteMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

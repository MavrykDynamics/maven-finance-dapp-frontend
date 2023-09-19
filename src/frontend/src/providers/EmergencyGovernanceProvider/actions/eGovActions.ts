import { unknownToError, WalletOperationError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

export const submitEGovProposal = async (
  eGovAddress: string,
  title: string,
  descr: string,
  feeAmount: number,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(eGovAddress)
    const delegateMetaData = await contract?.methods.triggerEmergencyControl(title, descr)

    return await getEstimationResult(delegateMetaData, { params: { amount: feeAmount } })
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

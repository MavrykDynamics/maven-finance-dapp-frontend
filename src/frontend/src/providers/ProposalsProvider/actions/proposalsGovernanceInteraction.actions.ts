import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

export const startProposalRound = async (
  governanceAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const startProposalRoundMetaData = contract?.methods.startProposalRound()

    return await getEstimationResult(startProposalRoundMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const startVotingRound = async (
  governanceAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const startVotingRoundMetaData = contract?.methods.startProposalRound()

    return await getEstimationResult(startVotingRoundMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const startNextRound = async (
  governanceAddress: string,
  executePastProposal: boolean,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const startNextRoundMetaData = contract?.methods.startNextRound(executePastProposal)

    return await getEstimationResult(startNextRoundMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

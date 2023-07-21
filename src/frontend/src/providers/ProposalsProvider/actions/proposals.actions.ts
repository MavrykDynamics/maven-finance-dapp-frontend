import { VotingTypes } from 'app/App.components/VotingArea/helpers/voting.const'
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

export const proposalRoundVote = async (
  governanceAddress: string,
  proposalId: number,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const proposeRoundVoteMetaData = contract?.methods.proposalRoundVote(proposalId)

    return await getEstimationResult(proposeRoundVoteMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const votingRoundVote = async (
  governanceAddress: string,
  vote: VotingTypes,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const votingRoundVoteMetaData = contract?.methods.votingRoundVote(vote)

    return await getEstimationResult(votingRoundVoteMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const executeProposal = async (
  governanceAddress: string,
  proposalId: number,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const executeProposalMetaData = contract?.methods.executeProposal(proposalId)

    return await getEstimationResult(executeProposalMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const processProposalPayment = async (
  governanceAddress: string,
  proposalId: number,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const processProposalPaymentMetaData = contract?.methods.processProposalPayment(proposalId)

    return await getEstimationResult(processProposalPaymentMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

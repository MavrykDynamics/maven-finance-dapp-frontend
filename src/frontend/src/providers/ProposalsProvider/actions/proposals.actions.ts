import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

export const proposalRoundVote = async (
  governanceAddress: string,
  proposalId: number,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  // add user address check when calling this method

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const proposeRoundVoteMetaData = contract?.methods.proposalRoundVote(proposalId)

    // for dapp callback
    // await dispatch(getGovernanceStorage())

    return await getEstimationResult(proposeRoundVoteMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const votingRoundVote = async (
  governanceAddress: string,
  vote: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  // add user address check when calling this method

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const votingRoundVoteMetaData = contract?.methods.votingRoundVote(vote)

    // for dapp callback
    // await dispatch(getGovernanceStorage())

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
  // add user address check when calling this method

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const executeProposalMetaData = contract?.methods.executeProposal(proposalId)

    // for dapp callback
    // await dispatch(getGovernanceStorage())

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
  // add user address check when calling this method

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceAddress)
    const processProposalPaymentMetaData = contract?.methods.processProposalPayment(proposalId)

    // for dapp callback
    // await dispatch(getGovernanceStorage())

    return await getEstimationResult(processProposalPaymentMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

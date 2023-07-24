import { VotingTypes } from 'app/App.components/VotingArea/helpers/voting.const'
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

export const votingFinancialRequestVote = async (
  governanceFinancialAddress: string,
  vote: `${VotingTypes}`,
  requestId: number,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceFinancialAddress)
    const finRequestVoteMetaData = contract?.methods.voteForRequest(requestId, vote)

    return await getEstimationResult(finRequestVoteMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

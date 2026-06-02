import { buildProviderReturnValue } from 'providers/common/utils/buildProviderReturnValue'
import { ProposalStatus } from 'providers/ProposalsProvider/helpers/proposals.const'
import { convertNumberForClient } from 'utils/calcFunctions'

import { FinancialRequestsContext, FinancialRequestsIndexerType, FinRequestsSubsRecordType, NullableFinancialRequestsContextStateType } from '../financialRequests.provider.types'
import { ALL_FIN_REQUESTS_SUB, EMPTY_FINANCIAL_REQUESTS_CTX, FIN_REQUESTS_DATA, ONGOING_FIN_REQUESTS_SUB } from './financialRequests.consts'
import { finRequestVote } from './financialRequests.schema'
import { FinancialRequestRecord, FinRequestVoteType } from './financialRequests.types'

/**
 *
 * @param mixedUpRequestsIds all fin requests ids
 * @param mixedUpRequestsMapper fin requests Record where key is from "mixedUpRequestsIds"
 * @returns {pass, ongoing} requests based on current time (usually used when query sub type is "all")
 */
export const distinctRequestsByExecuting = (
  mixedUpRequestsIds: string[],
  mixedUpRequestsMapper: FinancialRequestsContext['financialRequestsMapper'],
) => {
  return mixedUpRequestsIds.reduce<{
    ongoing: string[]
    past: string[]
  }>(
    (acc, requestId) => {
      const request = mixedUpRequestsMapper[requestId]
      const isPastRequest =
        request.executed ||
        (request.votingTillTime && new Date(request.votingTillTime).getTime() < +Date.now()) ||
        request.status === 1
      acc[isPastRequest ? 'past' : 'ongoing'].push(requestId)

      return acc
    },
    {
      ongoing: [],
      past: [],
    },
  )
}

/**
 *
 * @param storage GQL response which contains fin requests data
 * NOTE: If you subscribed to ongoing fin requests, you will get only ongoing fin requsts
 * cuz query gas filter for it, so normalizer will return ongpoing: [ids], allIds[fromOngoingIds], past[empty], mapper[ongoing]
 * this works in the same way for past fin requests
 * for all fin requests it will return both: past and ongoing
 * @returns normalized data for finrequsts provider {past, ongoing, all, mapper}
 */
export const normalizeFinancialRequests = (storage: {
  governance_financial_request: FinancialRequestsIndexerType['governance_financial_request']
}) => {
  const { financialRequestMapper, frIds } = storage?.governance_financial_request.reduce<{
    financialRequestMapper: Record<number, FinancialRequestRecord>
    frIds: string[]
  }>(
    (acc, item) => {
      const { token_address } = item.token

      if (!token_address) return acc

      const frItem: FinancialRequestRecord = {
        tokenAddress: token_address,
        id: item.id,
        type: item.request_type,
        purpose: item.request_purpose,
        requesterAddress: item.requester.address,
        requestedTime: item.requested_datetime,
        governanceContract: item.governance_financial.governance.address,
        governanceFinId: item.governance_financial.address,
        treasuryContract: item.treasury.address,
        tokensAmount: item.token_amount,
        votingTillTime: item.executed ? item.execution_datetime : item.expiration_datetime,
        droppedTime: item.dropped_datetime ?? null,
        executed: item.executed,
        status: item.status,

        votes: item.votes.reduce<Array<FinRequestVoteType>>((acc, vote) => {
          try {
            const _vote = finRequestVote.parse({
              governanceFinRequestId: vote.governance_financial_request_id,
              id: vote.id,
              timestamp: vote.timestamp,
              voter: vote.voter.address,
              vote: vote.vote,
            })

            acc.push(_vote)
          } catch (e) {
            console.error('financial request votes parse error: ', { e })
          } finally {
            return acc
          }
        }, []),

        // Votes data
        yayVotesMvnTotal: convertNumberForClient({ number: item.yay_vote_smvn_total }),
        nayVotesMvnTotal: convertNumberForClient({ number: item.nay_vote_smvn_total }),
        sMVNTotalSupply: convertNumberForClient({ number: item.snapshot_smvn_total_supply }),
        quorum: item.smvn_percentage_for_approval / 100,
      }

      acc.frIds.push(frItem.id.toString())
      acc.financialRequestMapper[frItem.id] = frItem

      return acc
    },
    { financialRequestMapper: {}, frIds: [] },
  )

  const { past, ongoing } = distinctRequestsByExecuting(frIds, financialRequestMapper)
  return { financialRequestMapper, financialRequestsIds: frIds, ongoingFrIds: ongoing, pastFrIds: past }
}

export const getRequestStatus = (request: FinancialRequestRecord) => {
  if (request.executed) return ProposalStatus.EXECUTED

  if (request.votingTillTime && new Date(request.votingTillTime).getTime() < +Date.now()) return ProposalStatus.DEFEATED

  return ProposalStatus.ONGOING
}

// fin requests context return value helper
type FinRequestsContextReturnValueArgs = {
  finRequestsCtxState: NullableFinancialRequestsContextStateType
  changeFinancialRequestsSubscriptionList: FinancialRequestsContext['changeFinancialRequestsSubscriptionList']
  activeSubs: FinRequestsSubsRecordType
}

export const getFinRequestsProviderReturnValue = ({
  finRequestsCtxState,
  changeFinancialRequestsSubscriptionList,
  activeSubs,
}: FinRequestsContextReturnValueArgs) => {
  const { pastFinRequestsIds, ongoingFinRequestsIds, allFinRequestsIds, financialRequestsMapper } = finRequestsCtxState
  const commonToReturn = {
    changeFinancialRequestsSubscriptionList,
  }

  /**
   * 1. If no subs and mapper is null
   * 2. if query type === "all" and no data
   * 3. if query type === "ongoing" and no data
   */
  const isLoading =
    (!activeSubs[FIN_REQUESTS_DATA] && financialRequestsMapper === null) ||
    (activeSubs[FIN_REQUESTS_DATA] === ALL_FIN_REQUESTS_SUB &&
      (allFinRequestsIds === null || pastFinRequestsIds === null || ongoingFinRequestsIds === null)) ||
    (activeSubs[FIN_REQUESTS_DATA] === ONGOING_FIN_REQUESTS_SUB && ongoingFinRequestsIds === null)

  return buildProviderReturnValue(
    finRequestsCtxState,
    EMPTY_FINANCIAL_REQUESTS_CTX,
    commonToReturn,
    Boolean(isLoading),
  )
}

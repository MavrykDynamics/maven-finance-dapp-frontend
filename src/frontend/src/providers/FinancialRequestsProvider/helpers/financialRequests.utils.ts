import { calcWithoutPrecision } from 'utils/calcFunctions'
import { FinRequestVoteType, FinancialRequestRecord } from './financialRequests.types'
import { GetFinRequestsStorageQuery } from 'utils/__generated__/graphql'
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import {
  FinRequestsSubsRecordType,
  FinancialRequestsContext,
  FinancialRequestsStateType,
  NullableFinancialRequestsContextStateType,
} from '../financialRequests.types'
import {
  ALL_FIN_REQUESTS_SUB,
  EMPTY_FINANCIAL_REQUESTS_CTX,
  FIN_REQUESTS_DATA,
  ONGOING_FIN_REQUESTS_SUB,
  PAST_FIN_REQUESTS_SUB,
} from './financialRequests.consts'
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import { finRequestVote } from './financialRequests.schema'

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

export const normalizeFinancialRequests = (storage: {
  governance_financial_request: GetFinRequestsStorageQuery['governance_financial_request']
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
            console.error('governance_votes vote parse error: ', { e })
          } finally {
            return acc
          }
        }, []),

        // Votes data
        forVotesMVKTotal: calcWithoutPrecision(item.yay_vote_smvk_total),
        againstVotesMVKTotal: calcWithoutPrecision(item.nay_vote_smvk_total),
        sMVKTotakSupply: calcWithoutPrecision(item.snapshot_smvk_total_supply),
        quorum: item.smvk_percentage_for_approval / 100,
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
   * 2. if query type === "past" and no data
   * 2. if query type === "ongoing" and no data
   */
  let isLoading =
    (!activeSubs[FIN_REQUESTS_DATA] && financialRequestsMapper === null) ||
    (activeSubs[FIN_REQUESTS_DATA] === ALL_FIN_REQUESTS_SUB && allFinRequestsIds === null) ||
    (activeSubs[FIN_REQUESTS_DATA] === PAST_FIN_REQUESTS_SUB && pastFinRequestsIds === null) ||
    (activeSubs[FIN_REQUESTS_DATA] === ONGOING_FIN_REQUESTS_SUB && ongoingFinRequestsIds === null)

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_FINANCIAL_REQUESTS_CTX,
      isLoading: true,
    }
  }

  const { closestOngoingFinRequestToBeExpired, ...rest } = finRequestsCtxState

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<
    Omit<FinancialRequestsStateType, 'closestOngoingFinRequestToBeExpired'>
  >(rest, EMPTY_FINANCIAL_REQUESTS_CTX)
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}

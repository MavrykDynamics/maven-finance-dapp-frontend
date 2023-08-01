import { calcWithoutPrecision } from 'utils/calcFunctions'
import { FinancialRequestRecord } from './financialRequests.types'
import { GetFinRequestsStorageSubscription } from 'utils/__generated__/graphql'
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import {
  FinRequestsSubsRecordType,
  FinancialRequestsContext,
  FinancialRequestsStateType,
} from '../financialRequests.types'
import { EMPTY_FINANCIAL_REQUESTS_CTX, FIN_REQUESTS_DATA } from './financialRequests.consts'
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'

export const normalizeFinancialRequests = (storage: {
  governance_financial_request: GetFinRequestsStorageSubscription['governance_financial_request']
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

        // Votes data
        votes: item.votes,
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
  return { financialRequestMapper, financialRequestsIds: frIds }
}

export const getRequestStatus = (request: FinancialRequestRecord) => {
  if (request.executed) return ProposalStatus.EXECUTED

  if (request.votingTillTime && new Date(request.votingTillTime).getTime() < +Date.now()) return ProposalStatus.DEFEATED

  return ProposalStatus.ONGOING
}

// fin requests context return value helper
type DoormanContextReturnValueArgs = {
  finRequestsCtxState: FinancialRequestsStateType
  changeFinancialRequestsSubscriptionList: FinancialRequestsContext['changeFinancialRequestsSubscriptionList']
  activeSubs: FinRequestsSubsRecordType
}

export const getFinRequestsProviderReturnValue = ({
  finRequestsCtxState,
  changeFinancialRequestsSubscriptionList,
  activeSubs,
}: DoormanContextReturnValueArgs) => {
  const { pastFinRequestsIds, ongoingFinRequestsIds, allFinRequestsIds, financialRequestsMapper } = finRequestsCtxState
  const commonToReturn = {
    changeFinancialRequestsSubscriptionList,
  }

  const areOngoingRequestsNullable = ongoingFinRequestsIds === null || financialRequestsMapper === null
  const arePastRequestsNullable = pastFinRequestsIds === null || financialRequestsMapper === null
  const areAllRequestsNullable = allFinRequestsIds === null || financialRequestsMapper === null

  const isLoading =
    (activeSubs[FIN_REQUESTS_DATA] && areOngoingRequestsNullable) ||
    (activeSubs[FIN_REQUESTS_DATA] && arePastRequestsNullable) ||
    (activeSubs[FIN_REQUESTS_DATA] && areAllRequestsNullable) ||
    (!activeSubs[FIN_REQUESTS_DATA] &&
      areOngoingRequestsNullable &&
      !activeSubs[FIN_REQUESTS_DATA] &&
      arePastRequestsNullable &&
      !activeSubs[FIN_REQUESTS_DATA] &&
      areAllRequestsNullable)

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_FINANCIAL_REQUESTS_CTX,
      isLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<FinancialRequestsStateType>(
    finRequestsCtxState,
    EMPTY_FINANCIAL_REQUESTS_CTX,
  )
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}

import { calcWithoutPrecision } from 'utils/calcFunctions'
import { FinancialRequestRecord } from 'utils/TypesAndInterfaces/Governance'
import { GovernanceFinancialRequestGraphQL } from '../../utils/TypesAndInterfaces/Governance'
import { FinancialRequestStoreType } from 'reducers/financialRequests'
import { ProposalStatus } from 'providers/ProposalsProvider/helpers/proposals.const'

export const normalizeFinancialRequests = (storage: {
  governance_financial_request: Array<GovernanceFinancialRequestGraphQL>
}) => {
  const { financialRequestMapper, frIds } = storage?.governance_financial_request.reduce<{
    financialRequestMapper: Record<number, FinancialRequestRecord>
    frIds: number[]
  }>(
    (acc, item) => {
      const { token_address } = item.token

      if (!token_address) return acc

      const frItem = {
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

      acc.frIds.push(frItem.id)
      acc.financialRequestMapper[frItem.id] = frItem

      return acc
    },
    { financialRequestMapper: {}, frIds: [] },
  )
  return { financialRequestMapper, financialRequestsIds: frIds }
}

export const distinctRequestsByExecuting = (
  mixedUpRequestsIds: number[],
  mixedUpRequestsMapper: FinancialRequestStoreType['financialRequestMapper'],
) => {
  return mixedUpRequestsIds.reduce<{
    ongoing: number[]
    past: number[]
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

export const getRequestStatus = (request: FinancialRequestRecord) => {
  if (request.executed) return ProposalStatus.EXECUTED

  if (request.votingTillTime && new Date(request.votingTillTime).getTime() < +Date.now()) return ProposalStatus.DEFEATED

  return ProposalStatus.ONGOING
}

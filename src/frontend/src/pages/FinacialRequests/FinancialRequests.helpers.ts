import { State } from 'reducers'
import { calcWithoutMu, calcWithoutPrecision } from 'utils/calcFunctions'
import { FinancialRequestRecord, ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { GovernanceFinancialRequestGraphQL } from '../../utils/TypesAndInterfaces/Governance'
import { FinancialRequestStoreType } from 'reducers/financialRequests'

export const normalizeFinancialRequests = (
  storage: {
    governance_financial_request: Array<GovernanceFinancialRequestGraphQL>
  },
  dipDupTokens: State['tokens']['dipDupTokens'],
) => {
  const { financialRequestMapper, frIds } = storage?.governance_financial_request.reduce<{
    financialRequestMapper: Record<number, FinancialRequestRecord>
    frIds: number[]
  }>(
    (acc, item) => {
      const tokenName = dipDupTokens.find(({ contract }) => contract === item.token_address)?.metadata.symbol ?? 'MVK'
      const frItem = {
        tokenAddress: item.token_address,
        id: item.id,
        type: item.request_type,
        purpose: item.request_purpose,
        requesterAddress: item.requester_id,
        requestedTime: item.requested_datetime,
        governanceContract: item.governance_financial.governance.address,
        governanceFinId: item.governance_financial_id,
        treasuryContract: item.treasury_id,
        votingTillTime: item.execution_datetime ?? item.expiration_datetime,
        tokensAmount: tokenName === 'MVK' ? calcWithoutPrecision(item.token_amount) : calcWithoutMu(item.token_amount),
        tokenName: tokenName,
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

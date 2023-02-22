import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { GovernanceFinancialRequestGraphQL } from '../../utils/TypesAndInterfaces/Governance'

export const normalizeFinancialRequests = (storage: {
  governance_financial_request: Array<GovernanceFinancialRequestGraphQL>
}) => {
  const financialRequestLedger = storage?.governance_financial_request
  return financialRequestLedger
}

export const distinctRequestsByExecuting = (
  mixedUpRequests: GovernanceFinancialRequestGraphQL[],
): {
  ongoing: GovernanceFinancialRequestGraphQL[]
  past: GovernanceFinancialRequestGraphQL[]
} => {
  const ongoing: GovernanceFinancialRequestGraphQL[] = [],
    past: GovernanceFinancialRequestGraphQL[] = []
  if (!mixedUpRequests) return { ongoing, past }

  mixedUpRequests.forEach((request) => {
    if (request.executed || new Date(request.expiration_datetime as string).getTime() < +Date.now()) {
      past.push(request)
    } else {
      ongoing.push(request)
    }
  })
  return {
    ongoing,
    past,
  }
}

export const getRequestStatus = (request: GovernanceFinancialRequestGraphQL) => {
  if (!request.executed) {
    if (new Date(request.expiration_datetime as string).getTime() < +Date.now()) {
      return ProposalStatus.DEFEATED
    } else {
      return ProposalStatus.ONGOING
    }
  } else {
    return ProposalStatus.EXECUTED
  }
}

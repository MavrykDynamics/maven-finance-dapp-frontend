import { OperationVariables, TypedDocumentNode, gql } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { FinancialRequestType } from '../financialRequests.types'
import { GetFinRequestsStorageSubscription } from 'utils/__generated__/graphql'
import { FIN_REQUSTS_ONGOING } from '../helpers/financialRequests.consts'

export const SUBSCRIPTION_FINANCIAL_REQUESTS_STORAGE = ''

export function getFinancialRequestsStorageSubscription({
  requestType,
}: {
  requestType: FinancialRequestType | null
}): DocumentNode | TypedDocumentNode<GetFinRequestsStorageSubscription, OperationVariables> {
  const timeOperator = requestType === FIN_REQUSTS_ONGOING ? '_gte' : '_lte'
  const filteredQuery = `_or: [{executed: {_eq: false}, expiration_datetime: {${timeOperator}: $currentTime}}, {executed: {_eq: true}, execution_datetime: {${timeOperator}: $currentTime}}]`

  return gql(`
   subscription getFinRequestsStorage($currentTime: timestamptz = "1970-01-01T00:00:00.000Z") {
     governance_financial_request(order_by: {requested_datetime: desc}, where: {${filteredQuery}}) {
        executed
        expiration_datetime
        execution_datetime
        id
        request_purpose
        request_type
        requested_datetime
        smvk_percentage_for_approval
        requester {
          address
        }
        snapshot_smvk_total_supply
        status
        token_amount
        token {
          token_address
        }
        governance_financial {
          address
        }
        treasury {
          address
        }
        pass_vote_smvk_total
        nay_vote_smvk_total
        yay_vote_smvk_total
        votes {
          governance_financial_request_id
          id
          timestamp
          vote
          voter_id
          voter {
            address
          }
        }
        governance_financial {
          governance {
            address
          }
        }
      }
    }
  `)
}

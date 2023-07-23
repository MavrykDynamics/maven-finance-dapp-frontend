import { OperationVariables, TypedDocumentNode, gql } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { FinancialRequestType } from '../financialRequests.types'
import { GetFinRequestsStorageSubscription } from 'utils/__generated__/graphql'
import { FIN_REQUSTS_ONGOING } from '../helpers/financialRequests.consts'

export const SUBSCRIPTION_FINANCIAL_REQUESTS_STORAGE = ''

export function getFinancialRequestsStorageSubscription({
  requestType,
  timestamp,
}: {
  requestType: FinancialRequestType | null
  timestamp?: string
}): DocumentNode | TypedDocumentNode<GetFinRequestsStorageSubscription, OperationVariables> {
  // const timeOperator = requestType === FIN_REQUSTS_ONGOING ? '_gte' : '_lte'
  // const filterByrequestPast = `order_by: {requested_datetime: desc}, where: {_or: [{executed: {_eq: false}, expiration_datetime: {${timeOperator}: $timestamp}}, {executed: {_eq: true}, execution_datetime: {${timeOperator}: $timestamp}}]}`

  return gql(`
    subscription getFinRequestsStorage {
      governance_financial_request {
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

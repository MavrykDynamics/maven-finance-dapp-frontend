import { OperationVariables, TypedDocumentNode, gql } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { FinRequestsSubsRecordType } from '../financialRequests.types'
import { GetFinRequestsStorageQuery } from 'utils/__generated__/graphql'
import { ALL_FIN_REQUESTS_SUB, ONGOING_FIN_REQUESTS_SUB, FIN_REQUESTS_DATA } from '../helpers/financialRequests.consts'

export const SUBSCRIPTION_FINANCIAL_REQUESTS_STORAGE = ''

export function getFinancialRequestsStorageSubscription({
  requestType,
}: {
  requestType: FinRequestsSubsRecordType[typeof FIN_REQUESTS_DATA]
}): DocumentNode | TypedDocumentNode<GetFinRequestsStorageQuery, OperationVariables> {
  const timeOperator = requestType === ONGOING_FIN_REQUESTS_SUB ? '_gte' : '_lte'

  let filteredQuery = `_or: [{executed: {_eq: false}, expiration_datetime: {${timeOperator}: $currentTimestamp}}, {executed: {_eq: true}, execution_datetime: {${timeOperator}: $currentTimestamp}}]`
  filteredQuery =
    requestType === ALL_FIN_REQUESTS_SUB
      ? '_or: [{expiration_datetime: {_gte: $currentTimestamp}}, {execution_datetime: {_lte: $currentTimestamp}}]'
      : filteredQuery

  return gql(`
   query getFinRequestsStorage($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z") {
    governance_financial_request: governance_financial_request(order_by: {requested_datetime: desc}, where: {${filteredQuery}}) {
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

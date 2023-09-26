import { gql } from 'utils/__generated__'

export const ALL_FINANCIAL_REQUESTS_QUERY = gql(`
  query getAllFinRequestsQuery{
    governance_financial_request: governance_financial_request(order_by: {requested_datetime: desc}) {
      executed
      expiration_datetime
      dropped_datetime
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

// If will need past requests query just copy ACTIVE_FINANCIAL_REQUESTS_QUERY and change _gte -> _lte
export const ACTIVE_FINANCIAL_REQUESTS_QUERY = gql(`
  query getActiveFinRequestsQuery($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z") {
    governance_financial_request: governance_financial_request(order_by: {requested_datetime: desc}, where: {_or: [{executed: {_eq: false}, expiration_datetime: {_gte: $currentTimestamp}}, {executed: {_eq: true}, execution_datetime: {_gte: $currentTimestamp}}]}) {
      executed
      expiration_datetime
      dropped_datetime
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

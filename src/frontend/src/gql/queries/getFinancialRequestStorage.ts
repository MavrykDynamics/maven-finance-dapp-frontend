export const FINANCIAL_REQUESTS_STORAGE_QUERY = `
  query GetFinRequestsStorageQuery {
    governance_financial_request(order_by: {requested_datetime: desc}) {
      executed
      expiration_datetime
      execution_datetime
      id
      request_purpose
      request_type
      requested_datetime
      smvk_percentage_for_approval
      requester_id
      snapshot_smvk_total_supply
      status
      token_amount
      token_address
      treasury_id
      governance_financial_id
      pass_vote_smvk_total
      nay_vote_smvk_total
      yay_vote_smvk_total
      votes {
        governance_financial_request_id
        id
        timestamp
        vote
        voter_id
      }
      governance_financial {
        governance {
          address
        }
      }
    }
  }
`

export const FINANCIAL_REQUESTS_STORAGE_QUERY_NAME = 'GetFinRequestsStorageQuery'
export const FINANCIAL_REQUESTS_STORAGE_QUERY_VARIABLE = {}

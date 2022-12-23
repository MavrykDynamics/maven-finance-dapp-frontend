export const LOANS_QUERY = `query GetLoansStorage {
  lending_controller(where: {mock_time: {_eq: true}}) {
    history_data {
      type
      amount
      timestamp
    }
    loan_tokens {
      lp_token_address
      utilisation_rate
      total_borrowed
      total_remaining
    }
  }
}`

export const LOANS_QUERY_NAME = 'GetLoansStorage'
export const LOANS_QUERY_VARIABLE = {}

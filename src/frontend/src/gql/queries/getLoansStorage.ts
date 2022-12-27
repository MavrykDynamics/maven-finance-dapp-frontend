export const LOANS_QUERY = `query GetLoansStorage {
  lending_controller(where: {mock_time: {_eq: true}}) {
    history_data {
      type
      amount
      timestamp
    }
    loan_tokens {
      lp_token_address
      loan_token_name
      utilisation_rate
      total_borrowed
      total_remaining
      reserve_ratio
      history_data {
        type
        amount
        timestamp
        operation_hash
        sender_id
        loan_token {
          loan_token_address
        }
      }
      vaults {
        owner_id
        collateral_balances {
          balance
          token {
            token_address
          }
        }
      }
    }
  }
}`

export const LOANS_QUERY_NAME = 'GetLoansStorage'
export const LOANS_QUERY_VARIABLE = {}

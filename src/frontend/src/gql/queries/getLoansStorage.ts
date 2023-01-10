export const LOANS_QUERY = `query GetLoansStorage {
  lending_controller(where: {mock_time: {_eq: true}}) {
    address
    collateral_ratio

    history_data {
      type
      amount
      timestamp
    }

    collateral_tokens {
      token_address
      balances_aggregate {
        aggregate {
          sum {
            balance
          }
        }
      }
    }

    loan_tokens {
      lp_token_address
      loan_token_name
      utilisation_rate
      total_borrowed
      token_pool_total
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
        collateral_balances {
          token {
            token_address
          }
          balance
        }
        vault {
          depositors {
            depositor_id
          }
        }
        loan_token {
          loan_token_address
          loan_token_name
        }
        
        loan_principal_total
        loan_interest_total
        owner_id
        loan_outstanding_total
      }
    }
  }
}`

export const LOANS_QUERY_NAME = 'GetLoansStorage'
export const LOANS_QUERY_VARIABLE = {}

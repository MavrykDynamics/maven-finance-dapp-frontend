export const LOANS_QUERY = `query GetLoansStorage {
  lending_controller(where: {mock_time: {_eq: true}}) {
    address
    collateral_ratio
    interest_treasury_share
    interest_rate_decimals
    decimals
    history_data {
      type
      amount
      timestamp
    }

    collateral_tokens {
      token_address
      id
      token_name
      token_contract_standard
      protected
    }

    loan_tokens {
      loan_token_contract_standard
      lp_token_address
      loan_token_name
      id
      utilisation_rate
      total_borrowed
      token_pool_total
      total_remaining
      reserve_ratio
      current_interest_rate
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

export const NEW_VAULT_QUERY = `
query GetNewVault {
  vault {
    lending_controller_vaults(order_by: {last_updated_timestamp: asc}, where: {lending_controller: {mock_time: {_eq: true}}}) {
      last_updated_timestamp
      vault_id
    }
  }
}
`

export const NEW_VAULT_QUERY_NAME = 'GetNewVault'
export const NEW_VAULT_QUERY_VARIABLE = {}

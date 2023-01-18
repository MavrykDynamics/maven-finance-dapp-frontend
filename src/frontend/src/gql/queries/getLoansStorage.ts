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
      loan_token {
        loan_token_name
      }
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
      loan_token_address
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

      vaults_aggregate(where: {loan_outstanding_total: {_neq: "0"}}) {
        aggregate {
          count(distinct: true, columns: owner_id)
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
          lending_controller_vaults {
            history_data(where: {type: {_eq: "2"}}) {
              type
              sender_id
            }
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

export const USER_LENDING_DATA_QUERY = `
query GetLendBorrowHistoryPerUser($userAddress: String = "", $_in: [smallint!] = ["0", "1", "2", "3"]) {
  mavryk_user(where: {address: {_eq: $userAddress}}) {
    lending_controller_history_data_sender(where: {lending_controller: {mock_time: {_eq: true}}, type: {_in: $_in}}, order_by: {type: asc, timestamp: asc}) {
      type
      timestamp
      sender_id
      operation_hash
      loan_token_id
      level
      lending_controller_id
      id
      amount
      vault_id
      loan_token {
        lp_token_address
        loan_token_name
        loan_token_address
        loan_token_contract_standard
      }
    }
  }
}
`

export const USER_LENDING_DATA_QUERY_NAME = 'GetLendBorrowHistoryPerUser'
export const USER_LENDING_DATA_QUERY_VARIABLE = (userAddress?: string) => {
  return { userAddress: userAddress ?? '' }
}

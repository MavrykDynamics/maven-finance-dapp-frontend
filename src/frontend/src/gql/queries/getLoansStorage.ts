export const LOANS_QUERY = `
  query GetLoansStorage {
    lending_controller(where: {mock_time: {_eq: false}}) {
      address
      collateral_ratio
      interest_treasury_share
      interest_rate_decimals
      minimum_loan_fee_pct
      decimals
      history_data(where: {type: {_in: ["0", "1", "2", "3", "4", "5", "6", "7"]}}, distinct_on: timestamp, order_by: {timestamp: asc}) {
        type
        amount
        timestamp
        loan_token {
          loan_token_name
          oracle_id
          loan_token_address
        }
      }

      collateral_tokens {
        token_address
        id
        token_name
        token_contract_standard
        protected
        oracle_id
      }

      loan_tokens {
        loan_token_contract_standard
        loan_token_address
        loan_token_name
        id
        utilisation_rate
        total_borrowed
        token_pool_total
        total_remaining
        reserve_ratio
        current_interest_rate
        oracle_id

        history_data(where: {type: {_in: ["0", "1", "2", "3", "4", "5", "6", "7"]}}, distinct_on: timestamp, order_by: {timestamp: asc}) {
          type
          amount
          timestamp
          operation_hash
          sender_id
          vault {
            vault {
              address
            }
          } 
          loan_token {
            loan_token_name
            loan_token_address
            
            oracle_id
          }
        }

        vaults_aggregate(where: {loan_outstanding_total: {_neq: "0"}}) {
          aggregate {
            count(distinct: true, columns: owner_id)
          }
        }
      }
    }
  }
`

export const LOANS_QUERY_NAME = 'GetLoansStorage'
export const LOANS_QUERY_VARIABLE = {}

export const AVALIABLE_COLLATERALS_QUERY = `
  query GetAvaliableCollaterals {
    lending_controller(where: {mock_time: {_eq: false}}) {
      collateral_tokens {
        token_address
        id
        token_name
        token_contract_standard
        protected
        oracle_id
      }

      loan_tokens {
        loan_token_name
        oracle_id

        vaults {
          collateral_balances {
            token {
              token_address
              token_name
            }
          }
          loan_token {
            loan_token_address
            loan_token_name
            oracle_id
          }
        }
      }
    }
  }
`

export const AVALIABLE_COLLATERALS_QUERY_NAME = 'GetAvaliableCollaterals'
export const AVALIABLE_COLLATERALS_QUERY_VARIABLE = {}

export const NEW_VAULT_QUERY = `
  query GetUsersLastestCreatedVault($userAddress: String = "", $vaultName: String = "") {
    vault(order_by: {creation_timestamp: desc}, limit: 1, where: {name: {_eq: $vaultName}}) {
      creation_timestamp
      name
      lending_controller_vaults(order_by: {last_updated_timestamp: asc}, where: {owner_id: {_eq: $userAddress}, lending_controller: {mock_time: {_eq: false}}}) {
        last_updated_timestamp
        vault_id
      }
    }
  }
`

export const NEW_VAULT_QUERY_NAME = 'GetUsersLastestCreatedVault'
export const NEW_VAULT_QUERY_VARIABLE = (userAddress: string, vaultName: string) => ({ userAddress, vaultName })

export const USER_LENDING_DATA_QUERY = `
  query GetLendBorrowHistoryPerUser($userAddress: String = "", $_in: [smallint!] = ["0", "1", "2", "3"]) {
    mavryk_user(where: {address: {_eq: $userAddress}}) {
      lending_controller_history_data_sender(where: {lending_controller: {mock_time: {_eq: false}}, type: {_in: $_in}}, order_by: {type: asc, timestamp: asc}) {
        type
        timestamp
        operation_hash
        amount
        loan_token {
          oracle_id
          loan_token_name
          loan_token_address
          loan_token_contract_standard
          current_interest_rate
        }
        lending_controller {
          interest_rate_decimals
          interest_treasury_share
          decimals
        }
      }

      lending_controller_vaults(where: {lending_controller: {mock_time: {_eq: false}}}) {
        collateral_balances {
          balance
          token {
            token_name
            token_address
            oracle_id
          }
        }
        loan_decimals
        loan_principal_total
        loan_token {
          loan_token_name
          loan_token_address
          oracle_id
        }
      }
    }
  }
`

export const USER_LENDING_DATA_QUERY_NAME = 'GetLendBorrowHistoryPerUser'
export const USER_LENDING_DATA_QUERY_VARIABLE = (userAddress?: string) => {
  return { userAddress: userAddress ?? '' }
}

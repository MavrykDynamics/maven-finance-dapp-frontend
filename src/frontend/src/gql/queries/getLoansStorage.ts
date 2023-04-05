export const LOANS_QUERY = `
  query GetLoansStorage {
    lending_controller(where: {mock_time: {_eq: true}}) {
      address
      collateral_ratio
      interest_treasury_share
      interest_rate_decimals
      minimum_loan_fee_pct
      decimals
      history_data(where: {type: {_in: ["0", "1", "2", "3", "4", "5", "6", "7"]}}) {
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

        history_data(where: {type: {_in: ["0", "1", "2", "3", "4", "5", "6", "7"]}}) {
          type
          amount
          timestamp
          operation_hash
          sender_id
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

        vaults(order_by: {vault: {creation_timestamp: desc}}) {
          collateral_balances {
            token {
              token_address
              token_name
              oracle_id
            }
            balance
          }
          vault {
            address
            name
            depositors {
              depositor_id
            }
            allowance

            lending_controller_vaults {
              loan_principal_total
              loan_outstanding_total
              loan_interest_total
              borrow_index
            }
          }
          loan_token {
            loan_token_address
            loan_token_name
            loan_token_contract_standard
            oracle_id
            current_interest_rate
            borrow_index
          }
          lending_controller {
            liquidation_delay_in_minutes
          }
          id
          marked_for_liquidation_level
          last_updated_block_level
          loan_principal_total
          loan_interest_total
          owner_id
          loan_outstanding_total
          borrow_index
        }
      }
    }
  }
`

export const LOANS_QUERY_NAME = 'GetLoansStorage'
export const LOANS_QUERY_VARIABLE = {}

export const AVALIABLE_COLLATERALS_QUERY = `
  query GetAvaliableCollaterals {
    lending_controller(where: {mock_time: {_eq: true}}) {
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

      lending_controller_vaults(where: {lending_controller: {mock_time: {_eq: true}}}) {
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

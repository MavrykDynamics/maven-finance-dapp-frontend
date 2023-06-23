export const VAULTS_STORAGE_QUERY = `
query GetAllVaultsStorage {
  lending_controller(where: {mock_time: {_eq: false}}) {
    address
    interest_rate_decimals
    liquidation_delay_in_minutes
    liquidation_ratio
    collateral_ratio
    max_vault_liquidation_pct
    admin_liquidation_fee_pct
    liquidation_fee_pct
    decimals
    minimum_loan_fee_pct
    vaults(order_by: {vault: {creation_timestamp: desc}}, where: {open: {_eq: true}}) {
      collateral_balances {
        balance
        collateral_token {
          token {
            token_address
            token_standard
          }
          token_name
          oracle {
            address
          }
        }
      }
      vault {
        creation_timestamp
        address
        name
        baker {
          address
        }
        depositors {
          depositor {
            address
          }
        }
        allowance
      }
      lending_controller {
        liquidation_delay_in_minutes
      }
      last_updated_block_level
      owner {
        address
      }
      id
      marked_for_liquidation_level
      loan_outstanding_total
      loan_interest_total
      loan_principal_total
      loan_decimals
      liquidation_end_level
      internal_id
      borrow_index
      loan_token {
        loan_token_name
        token {
          token_address
          token_standard
        }
        oracle {
          address
        }
        current_interest_rate
        borrow_index
        total_remaining
        token_pool_total
        reserve_ratio
        min_repayment_amount
      }
    }
  }
}
`

export const VAULTS_STORAGE_QUERY_NAME = 'GetAllVaultsStorage'
export const VAULTS_STORAGE_QUERY_VARIABLE = {}

export const VAULTS_STORAGE_QUERY = `
  query GetVaultsStorageQuery {
    vault {
      address
      depositors {
        depositor {
          address
        }
      }
      lending_controller_vaults {
        owner_id
        loan_token {
          loan_token_name
          lp_token_address
        }
        collateral_balances {
          token {
            token_address
          }
          balance
        }
      }
    }
  }
`

export const VAULTS_STORAGE_QUERY_NAME = 'GetVaultsStorageQuery'
export const VAULTS_STORAGE_QUERY_VARIABLE = {}

export const VAULTS_QUERY = `
query GetAllVaultsStorage {
  lending_controller(where: {mock_time: {_eq: true}}) {
    admin
    address
    governance_id
    vault_deposit_paused
    vault_deposit_smvk_paused
    vault_on_liquidate_paused
    vault_withdraw_paused
    vault_withdraw_smvk_paused
    close_vault_paused
    liquidate_vault_paused
    mark_for_liquidation_paused
    borrow_paused
    interest_rate_decimals
    interest_treasury_share
    decimals
    last_updated_at
    liquidation_delay_in_minutes
    liquidation_fee_pct
    liquidation_ratio
    collateral_tokens {
      id
      is_scaled_token
      lending_controller_id
      oracle_id
      protected
      token_address
    }
    vaults {
      borrow_index
      collateral_balances {
        balance
        id
        lending_controller_vault_id
        token_id
        token {
          token_address
        }
      }
      vault {
        last_updated_at
        governance_id
        factory_id
        creation_timestamp
        allowance
        admin
        address
        depositors {
          depositor_id
        }
      }
      owner_id
      open
      loan_token_id
      marked_for_liquidation_level
      loan_principal_total
      loan_outstanding_total
      loan_interest_total
      loan_decimals
      liquidation_end_level
      lending_controller_id
      last_updated_timestamp
      last_updated_block_level
      internal_id
      id
      loan_token {
        lp_token_address
        loan_token_name
      }
    }
  }
}`

export const VAULTS_QUERY_NAME = 'GetAllVaultsStorage'
export const VAULTS_QUERY_VARIABLE = {}

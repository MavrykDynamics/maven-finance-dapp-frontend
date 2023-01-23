export const VAULTS_STORAGE_QUERY = `
query GetAllVaultsStorage {
  lending_controller(where: {mock_time: {_eq: true}}) {
    address
    liquidation_delay_in_minutes
    liquidation_ratio
    collateral_ratio
    vaults {
      collateral_balances {
        balance
        token {
          token_address
          oracle_id
        }
      }
      vault {
        creation_timestamp
        address
        depositors {
          depositor_id
        }
      }
      owner_id
      marked_for_liquidation_level
      loan_outstanding_total
      loan_decimals
      liquidation_end_level
      internal_id
      loan_token {
        lp_token_address
        loan_token_name
        oracle_id
      }
    }
  }
}`

export const VAULTS_STORAGE_QUERY_NAME = 'GetAllVaultsStorage'
export const VAULTS_STORAGE_QUERY_VARIABLE = {}

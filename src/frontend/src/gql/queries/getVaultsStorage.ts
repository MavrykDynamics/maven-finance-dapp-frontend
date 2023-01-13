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

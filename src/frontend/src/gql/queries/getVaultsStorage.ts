export const VAULTS_STORAGE_QUERY = `
  query GetVaultsStorageQuery {
    vault {
      address
      admin
      allowance
      creation_timestamp
    }
  }
`

export const VAULTS_STORAGE_QUERY_NAME = 'GetVaultsStorageQuery'
export const VAULTS_STORAGE_QUERY_VARIABLE = {}

export const VAULTS_QUERY = `
query GetVaults {
  lending_controller(where: {mock_time: {_eq: true}}) {
    vaults {
      collateral_balances {
        token {
          token_address
        }
        balance
      }
      vault {
        address
        admin
        allowance
        creation_timestamp
        
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
}`

export const VAULTS_QUERY_NAME = 'GetVaults'
export const VAULTS_QUERY_VARIABLE = {}

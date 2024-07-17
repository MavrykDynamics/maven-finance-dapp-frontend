import { gql } from 'utils/__generated__'

// TODO: remove unused fields
// vault accured interest indexes query
export const GET_VAULT_ACC_INT_INDEXES = gql(`
  query getVaultAccIntIndexesQuery($vaultAddress: String = "") {
		lending_controller: dev_lending_controller {
    interest_rate_decimals
    
    vaults(where: {vault: {address: {_eq: $vaultAddress}}}) {
      loan_outstanding_total
      loan_interest_total
      loan_principal_total
      
      borrow_index
      last_updated_block_level
      
      loan_token {
        borrow_index
        current_interest_rate
        token {
          metadata
        }
      }
      
      vault {
        name
      }
    }
  }
	}
`)

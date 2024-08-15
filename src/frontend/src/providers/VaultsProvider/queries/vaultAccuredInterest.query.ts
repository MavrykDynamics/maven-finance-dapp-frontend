import { gql } from 'utils/__generated__'

// vault accured interest indexes query
export const GET_VAULT_ACC_INT_INDEXES = gql(`
  query getVaultAccIntIndexesQuery($vaultAddress: String = "") {
		lending_controller: lending_controller {
      vaults(where: {vault: {address: {_eq: $vaultAddress}}}) {
        loan_interest_total
        borrow_index
        last_updated_block_level
        
        loan_token {
          borrow_index
          token {
            metadata
          }
        }
      }
    }
	}
`)

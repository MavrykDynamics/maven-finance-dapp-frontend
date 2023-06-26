export const LOANS_QUERY = `
query GetLoansStorage {
  lending_controller(where: {mock_time: {_eq: false}}) {
    collateral_ratio
    interest_treasury_share
    interest_rate_decimals
    minimum_loan_fee_pct
    decimals
    
    loan_tokens {
      loan_token_name
      id
      utilisation_rate
      total_borrowed
      token_pool_total
      total_remaining
      reserve_ratio
      current_interest_rate
      token {
        token_address
      }
      m_token {
        address
        accounts_aggregate(where: {balance: {_gte: 0}}) {
          aggregate {
            count
          }
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

export const NEW_VAULT_QUERY = `
  query GetUsersLastestCreatedVault($userAddress: String = "", $vaultName: String = "") {
    vault(order_by: {creation_timestamp: desc}, limit: 1, where: {name: {_eq: $vaultName}}) {
      creation_timestamp
      name
      lending_controller_vaults(order_by: {last_updated_timestamp: asc}, where: {owner: {address: {_eq: $userAddress}}, lending_controller: {mock_time: {_eq: false}}}) {
        last_updated_timestamp
        vault {
          address
        }
      }
    }
  }
`

export const NEW_VAULT_QUERY_NAME = 'GetUsersLastestCreatedVault'
export const NEW_VAULT_QUERY_VARIABLE = (userAddress: string, vaultName: string) => ({ userAddress, vaultName })

export const MVK_TOKEN_OPERATOR_QUERY = `
  query GetMvkTokenOperator($_userAddress: String) {
    mvk_token_operator(where: {owner: {address: {_eq: $_userAddress}}}) {
      operator {
        address
      }
      
      owner {
        address
      }
    }
  }
`

export const MVK_TOKEN_OPERATOR_QUERY_NAME = 'GetMvkTokenOperator'
export const MVK_TOKEN_OPERATOR_QUERY_VARIABLE = (address: string) => ({ _userAddress: address })

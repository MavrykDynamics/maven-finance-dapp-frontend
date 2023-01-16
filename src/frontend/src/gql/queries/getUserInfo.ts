export const USER_INFO_QUERY = `
query GetUserInfo ($_eq: String = "") {
  mavryk_user(where: {address: {_eq: $_eq}}) {
    address
    mvk_balance
    smvk_balance
    
    delegations {
      satellite {
        user {
          address
        }
      }
    }

    m_token_accounts {
      balance
      id
      m_token_id
      rewards_earned
      reward_index
      user_id
      m_token {
        address
        admin
        governance_id
        is_scaled_token
        last_updated_at
        loan_token_name
        token_reward_index
      }
    }
  }
}
`

export const USER_INFO_QUERY_NAME = 'GetUserInfo'
export function USER_INFO_QUERY_VARIABLES(address: string) {
  /* prettier-ignore */
  return { _eq: address }
}

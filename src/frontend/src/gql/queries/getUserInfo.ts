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


    stakes_history_data(where: {type: {_in: ["0", "1", "2", "3", "4"]}}) {
      type
      id
      desired_amount
      final_amount
      from_ {
        mvk_balance
        smvk_balance
      }
    }

    activeSatelliteRecord: satellites(where: {user_id: {_eq: $_eq}, _and: {currently_registered: {_eq: true}, _and: {status: {_eq: "0"}}}}) {
      user_id
    }
    
    vesteeRecord: vesting_vestees(where: {vestee_id: {_eq: $_eq}}) {
      vestee_id
    }
  }
}
`

export const USER_INFO_QUERY_NAME = 'GetUserInfo'
export function USER_INFO_QUERY_VARIABLES(address: string) {
  /* prettier-ignore */
  return { _eq: address }
}

// cycle data
export const SATELLITE_CYCLE_DATA_QUERY = `
query GetCurrentCycleGovernanceSatelliteSnapshot($_eq: String = "") {
	governance(where: {active: {_eq: true}}) {
		cycle_id
		satellite_snapshots(where: {user_id: {_eq: $_eq}}, order_by: {cycle: desc}) {
			cycle,
      ready
			}
		}
	}
`
export const SATELLITE_CYCLE_DATA_QUERY_NAME = 'GetCurrentCycleGovernanceSatelliteSnapshot'
export function SATELLITE_CYCLE_DATA_QUERY_VARIABLE(_eq: string) {
  return { _eq }
}

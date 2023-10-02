import { gql } from 'utils/__generated__'

export const FARMS_LIVE_ALL = gql(`
	query farmsAllLiveQuery {
		farm: farm(order_by: {creation_timestamp: desc}, where: {open: {_eq: true}}) {
			address
			name
			open
			creation_timestamp
			end_timestamp
			infinite

			lp_token_balance
			lp_token {
				token_address
			}

			withdraw_paused
			claim_paused
			deposit_paused

			is_m_farm
			current_reward_per_block

			farm_accounts {
				user {
					address
				}
				deposited_amount
				unclaimed_rewards
				participation_rewards_per_share
			}
		}
	}	
`)

export const FARMS_LIVE_STAKED = gql(`
	query farmsStakedLiveQuery($userAddress: String) {
		farm: farm(order_by: {creation_timestamp: desc}, where: {open: {_eq: true}, farm_accounts: {user: {address: {_eq: $userAddress}}}}) {
			address
			name
			open
			creation_timestamp
			end_timestamp
			infinite

			lp_token_balance
			lp_token {
				token_address
			}

			withdraw_paused
			claim_paused
			deposit_paused

			is_m_farm
			current_reward_per_block

			farm_accounts {
				user {
					address
				}
				deposited_amount
				unclaimed_rewards
				participation_rewards_per_share
			}
		}
	}	
`)

export const FARMS_FINISHED_ALL = gql(`
	query farmsAllFinishedQuery {
		farm: farm(order_by: {creation_timestamp: desc}, where: {open: {_eq: false}}) {
			address
			name
			open
			creation_timestamp
			end_timestamp
			infinite

			lp_token_balance
			lp_token {
				token_address
			}

			withdraw_paused
			claim_paused
			deposit_paused

			is_m_farm
			current_reward_per_block

			farm_accounts {
				user {
					address
				}
				deposited_amount
				unclaimed_rewards
				participation_rewards_per_share
			}
		}
	}	
`)

export const FARMS_FINISHED_STAKED = gql(`
	query farmsStakedFinishedQuery($userAddress: String) {
		farm: farm(order_by: {creation_timestamp: desc}, where: {open: {_eq: false}, farm_accounts: {user: {address: {_eq: $userAddress}}}}) {
			address
			name
			open
			creation_timestamp
			end_timestamp
			infinite

			lp_token_balance
			lp_token {
				token_address
			}

			withdraw_paused
			claim_paused
			deposit_paused

			is_m_farm
			current_reward_per_block

			farm_accounts {
				user {
					address
				}
				deposited_amount
				unclaimed_rewards
				participation_rewards_per_share
			}
		}
	}	
`)

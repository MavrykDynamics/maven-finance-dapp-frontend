import { gql } from 'utils/__generated__/gql'

export const SUBSCRIBE_USER_DATA = gql(`
subscription getUserData($userAddress: String = "") {
	mavryk_user(where: {address: {_eq: $userAddress}}) {
  	address
    smvk_balance
    mvk_balance

		# TODO: check how to get address, usage of mvk_transfer_sender & mvk_transfer_receiver is temp
    mvk_transfer_sender(limit: 1) {
      mvk_token {
        address
      }
    }
    mvk_transfer_receiver(limit: 1) {
      mvk_token {
        address
      }
    }

		# Getting user mToken balances
		m_token_accounts {
      balance
      rewards_earned
      reward_index
      m_token {
        token_reward_index
        address
        metadata
      }
    }
    
    delegations {
      satellite {
        user {
          address
        }
      }
    }

    # actions history
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

		# user's avatars
		# is user active satellite
		satellites {
			currently_registered
			status
      user {
				address
			}
			image
    }
    council_council_members{
      image
    }
    break_glass_council_members {
      image
    }
    
		# is user active vestee
    vesting_vestees {
      end_vesting_timestamp
    }

    # check if newly registered satellite
    governance_satellite_snapshots(order_by: {cycle: desc}) {
      cycle
      ready
      user {
        address
      }
      governance {
        cycle_id
      }
    }

    # get amount of actions that user has done as satellite per cycle
    # TODO: add cycle_id where filter, when it will be available, now it takes all actions
    governance_satellite_action_initiators_aggregate(where: {status: {_eq: "0"}}) {
      aggregate {
        count
      }
    }

    # user doorman rewards
    doorman_stake_accounts {
      participation_fees_per_share
      smvk_balance
      doorman {
        unclaimed_rewards
        accumulated_fees_per_share
      }
    }

    # user satellite rewards
    satellite_rewardss {
      unpaid
      paid
      participation_rewards_per_share
      reference {
        satellite_accumulated_reward_per_share
      }
    }

    # user farms rewards
    farm_accounts {
      deposited_amount
      participation_rewards_per_share
      farm {
        address
        accumulated_rewards_per_share
        current_reward_per_block
        last_block_update
        total_rewards
        paid_rewards
        unpaid_rewards
        infinite
        lp_token_balance
      }
    }
	}
}
`)

export const SUBSCRIBE_USER_PROPOSAL_REWARDS_DATA = gql(`
subscription getUserProposalRewardsData($userAddress: String = "") {
	governance_proposal(where: {reward_claim_ready: {_eq: true}, votes: {voter: {address: {_eq: $userAddress}}, _and: {voting_reward_claimed: {_eq: false}}}}) {
    id
  }
}
`)

import { gql } from 'utils/__generated__/gql'

export const USER_DATA_QUERY = gql(`
  query getUserData($userAddress: String = "") {
    mavryk_user: mavryk_user(where: {address: {_eq: $userAddress}}) {
      address
      smvk_balance
      mvk_balance
  
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
  
      # user's avatars
      # is user active satellite
      satellites {
        currently_registered
        status
        user {
          address
        }
        image
        name
      }
      council_council_members{
        image
        user {
          address
        }
      }
      break_glass_council_members {
        image
        user {
          address
        }
      }
      
      # is user active vestee
      vesting_vestees {
        end_vesting_timestamp
      }
  
      # check if newly registered satellite
      governance_satellite_snapshots(order_by: {cycle: desc}) {
        cycle
        ready
        next_snapshot_cycle_id
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
    }
  }
`)

export const USER_ACTIONS_HISTORY_DATA_QUERY = gql(`
  query getUserActionsHistoryData($userAddress: String, $offset: Int = 0, $limit: Int = 8) {
    mavryk_user: mavryk_user(where: {address: {_eq: $userAddress}}) {
      # actions history
      stakes_history_data(where: {type: {_in: ["0", "1", "2", "3", "4"]}}, order_by: {timestamp: desc}, offset: $offset, limit: $limit) {
        type
        id
        timestamp
        desired_amount
        final_amount
        from_ {
          mvk_balance
          smvk_balance
        }
      }

      historyItemsAmount: stakes_history_data_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`)

export const USER_REWARDS_DATA_QUERY = gql(`
  query getUserRewardsData($userAddress: String = "") {
    governance_proposal: governance_proposal(where: {reward_claim_ready: {_eq: true}, votes: {voter: {address: {_eq: $userAddress}}, _and: {voting_reward_claimed: {_eq: false}}}, payments_aggregate: {count: {predicate: {_gt: 0}}}}) {
      id
    }

    mavryk_user: mavryk_user(where: {address: {_eq: $userAddress}}) {
      smvk_balance

      # user doorman rewards, satellite claimed rewards, doorman claimed rewards
      doorman_stake_accounts {
        total_satellite_rewards_claimed
        total_exit_fee_rewards_claimed
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
        participation_rewards_per_share
        reference {
          satellite_accumulated_reward_per_share
        }
      }
  
      # user farms rewards
      farm_accounts {
        claimed_rewards
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

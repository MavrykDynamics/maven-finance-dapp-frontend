import { DocumentNode, OperationVariables, TypedDocumentNode, gql as apolloGql } from '@apollo/client'

import { FarmsQueryQuery } from 'utils/__generated__/graphql'
import { FarmsProviderSubsType } from '../farms.provider.types'

import {
  FARMS_DATA_SUB,
  FARMS_FINISHED_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_LIVE_DATA_SUB,
  FARMS_LIVE_STAKED_DATA_SUB,
} from './../helpers/farms.const'

const getFamrsFilter = (queryType: FarmsProviderSubsType[typeof FARMS_DATA_SUB]) => {
  if (queryType === FARMS_LIVE_DATA_SUB) return ``

  if (queryType === FARMS_FINISHED_DATA_SUB) return ``

  if (queryType === FARMS_LIVE_STAKED_DATA_SUB) return ``

  if (queryType === FARMS_FINISHED_STAKED_DATA_SUB) return ``

  return ``
}

export const getFarms = (
  queryType: FarmsProviderSubsType[typeof FARMS_DATA_SUB],
): DocumentNode | TypedDocumentNode<FarmsQueryQuery, OperationVariables> => {
  const farmsFilter = getFamrsFilter(queryType)

  return apolloGql(`
		query farmsQuery${farmsFilter} {
			farm {
				address
				claim_paused
				deposit_paused
				infinite
				init_block
				last_block_update
				open
				total_blocks
				withdraw_paused
				accumulated_rewards_per_share
				current_reward_per_block
				init
				lp_token_balance
				paid_rewards
				total_rewards
				unpaid_rewards
				force_rewards_from_transfer
				name
				creation_timestamp
				admin
				min_block_time_snapshot
				governance_id
				farm_accounts {
					claimed_rewards
					deposited_amount
					farm_id
					id
					unclaimed_rewards
					user {
						address
					}
					participation_rewards_per_share
				}
				lp_token {
					token_address
				}
			}
		}
	`)
}

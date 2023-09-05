import { DocumentNode, OperationVariables, TypedDocumentNode, gql as apolloGql } from '@apollo/client'

import { FarmsQueryQuery } from 'utils/__generated__/graphql'
import { FarmsProviderSubsType } from '../farms.provider.types'

import {
  FARMS_DATA_SUB,
  FARMS_ALL_DATA_SUB,
  FARMS_ALL_LIVE_DATA_SUB,
  FARMS_LIVE_STAKED_DATA_SUB,
  FARMS_ALL_FINISHED_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
} from './../helpers/farms.const'

const getFamrsFilter = (queryType: FarmsProviderSubsType[typeof FARMS_DATA_SUB]) => {
  if (queryType === FARMS_ALL_DATA_SUB) return ``

  if (queryType === FARMS_ALL_LIVE_DATA_SUB) return `, where: {open: {_eq: true}}`
  if (queryType === FARMS_LIVE_STAKED_DATA_SUB)
    return `, where: {open: {_eq: true}, farm_accounts: {user: {address: {_eq: $userAddress}}}}`

  if (queryType === FARMS_ALL_FINISHED_DATA_SUB) return `, where: {open: {_eq: false}}`
  if (queryType === FARMS_FINISHED_STAKED_DATA_SUB)
    return `, where: {open: {_eq: false}, farm_accounts: {user: {address: {_eq: $userAddress}}}}`

  return ``
}

// TODO: farm ends in time
export const getFarms = (
  queryType: FarmsProviderSubsType[typeof FARMS_DATA_SUB],
): DocumentNode | TypedDocumentNode<FarmsQueryQuery, OperationVariables> => {
  const farmsFilter = getFamrsFilter(queryType)

  return apolloGql(`
		query farmsQuery($userAddress: String) {
			farm(order_by: {creation_timestamp: desc} ${farmsFilter}) {
				address
				name
				open
				last_updated_at
				creation_timestamp
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
}

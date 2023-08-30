import { DocumentNode, OperationVariables, TypedDocumentNode, gql as apolloGql } from '@apollo/client'

import { FarmsQueryQuery } from 'utils/__generated__/graphql'
import { FarmsProviderSubsType } from '../farms.provider.types'

import {
  FARMS_ALL_DATA_SUB,
  FARMS_DATA_SUB,
  FARMS_FINISHED_NOT_STAKED_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_LIVE_NOT_STAKED_DATA_SUB,
  FARMS_LIVE_STAKED_DATA_SUB,
} from './../helpers/farms.const'

const getFamrsFilter = (queryType: FarmsProviderSubsType[typeof FARMS_DATA_SUB]) => {
  switch (queryType) {
    case FARMS_ALL_DATA_SUB:
      return ``

    case FARMS_LIVE_NOT_STAKED_DATA_SUB:
      return `, where: {open: {_eq: true}, lp_token_balance: {_eq: "0"}}`
    case FARMS_LIVE_STAKED_DATA_SUB:
      return `, where: {open: {_eq: true}, lp_token_balance: {_gt: "0"}}`

    case FARMS_FINISHED_NOT_STAKED_DATA_SUB:
      return `, where: {open: {_eq: false}, lp_token_balance: {_eq: "0"}}`
    case FARMS_FINISHED_STAKED_DATA_SUB:
      return `, where: {open: {_eq: false}, lp_token_balance: {_gt: "0"}}`

    default:
      return ''
  }
}

export const getFarms = (
  queryType: FarmsProviderSubsType[typeof FARMS_DATA_SUB],
): DocumentNode | TypedDocumentNode<FarmsQueryQuery, OperationVariables> => {
  const farmsFilter = getFamrsFilter(queryType)

  console.log({ queryType })

  return apolloGql(`
		query farmsQuery {
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

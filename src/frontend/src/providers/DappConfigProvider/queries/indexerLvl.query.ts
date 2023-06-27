import { gql } from 'utils/__generated__/gql'

export const SUBSCRIPTION_INDEXER_LVL = gql(`
  subscription subscribeToIndexerLevel {
    dipdup_head {
			level
			name
		}
  }
`)

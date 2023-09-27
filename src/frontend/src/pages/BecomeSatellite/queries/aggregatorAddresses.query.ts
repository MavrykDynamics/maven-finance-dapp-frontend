import { gql } from 'utils/__generated__'

export const AGGREGATOR_ADDRESSES_QUERY = gql(`
query GetCouncilActions {
    aggregator {
      address
    }
  }
`)

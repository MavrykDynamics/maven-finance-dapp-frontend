import { Order_By } from 'utils/__generated__/graphql'

export const getSatelliteByAddressFilters = (userAddress: string) => {
  return {
    where: { registration_timestamp: { _is_null: false }, user: { address: { _eq: userAddress } } },
    orderBy: { currently_registered: Order_By.Desc },
  }
}

export const getSatelliteActiveFilters = () => {
  return {
    where: { registration_timestamp: { _is_null: false }, currently_registered: { _eq: true }, status: { _eq: '0' } },
    orderBy: { currently_registered: Order_By.Desc },
  }
}

export const getSatelliteAllFilters = () => {
  return {
    where: { registration_timestamp: { _is_null: false } },
    orderBy: { currently_registered: Order_By.Desc },
  }
}

export const getSatelliteOracleFilters = () => {
  return {
    where: {
      registration_timestamp: { _is_null: false },
      _and: {
        user: {
          aggregator_oracles_aggregate: {
            count: {
              predicate: { _gte: 1 },
              filter: { observations_aggregate: { count: { predicate: { _gte: 1 } } } },
            },
          },
        },
      },
    },
    orderBy: { currently_registered: Order_By.Desc },
  }
}

export const getSatelliteByAddressFilters = (userAddress: string) => {
  return {
    where: { registration_timestamp: { _is_null: false }, user: { address: { _eq: userAddress } } },
    order_by: { currently_registered: 'desc' },
  }
}

export const getSatelliteActiveFilters = () => {
  return {
    where: { registration_timestamp: { _is_null: false }, currently_registered: { _eq: true }, status: { _eq: '0' } },
    order_by: { currently_registered: 'desc' },
  }
}

export const getSatelliteAllFilters = () => {
  return {
    where: { registration_timestamp: { _is_null: false } },
    order_by: { currently_registered: 'desc' },
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
    order_by: { currently_registered: 'desc' },
  }
}

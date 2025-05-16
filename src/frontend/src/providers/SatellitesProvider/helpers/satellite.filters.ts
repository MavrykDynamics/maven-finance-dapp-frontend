// by address -> SATELLITE_DATA_QUERY
// $userAddress: String!, $limit: Int = 10, $offset: Int = 0
// satelliteAddresses -> order_by: {currently_registered: desc}, limit: $limit, offset: $offset
// satellite -> where: {registration_timestamp: {_is_null: false}, user: {address: {_eq: $userAddress}}}, order_by: {currently_registered: desc}, limit: $limit, offset: $offset

// -----------------------------------------------

// load all active satellites -> ACTIVE_SATELLITES_DATA_QUERY
// $limit: Int = 10, $offset: Int = 0
// satelliteAddresses -> order_by: {currently_registered: desc}, limit: $limit, offset: $offset
// satellite -> where: {registration_timestamp: {_is_null: false}, currently_registered: {_eq: true}, status: {_eq: "0"}}, order_by: {currently_registered: desc}, limit: $limit, offset: $offset

// -----------------------------------------------

// all satellites -> ALL_SATELLITES_DATA_QUERY
// $limit: Int = 10, $offset: Int = 0
// staelliteAddresses-> order_by: {currently_registered: desc}, limit: $limit, offset: $offset
// satellite -> where: {registration_timestamp: {_is_null: false}}, order_by: {currently_registered: desc}, limit: $limit, offset: $offset

// -----------------------------------------------

// oracles -> ORACLES_SATELLITES_DATA_QUERY
// $limit: Int = 10, $offset: Int = 0
// satelliteAddresses -> order_by: {currently_registered: desc}, limit: $limit, offset: $offset
// satellite -> where: {registration_timestamp: {_is_null: false}, _and: {user: {aggregator_oracles_aggregate: {count: {predicate: {_gte: 1}, filter: {observations_aggregate: {count: {predicate: {_gte: 1}}}}}}}}}, order_by: {currently_registered: desc}, limit: $limit, offset: $offset

export const DEFAULT_SATELLITE_BY_ADDRESS_FILTERS = (userAddress: string) => {
  return {
    where: { registration_timestamp: { _is_null: false }, user: { address: { _eq: userAddress } } },
    order_by: { currently_registered: 'desc' },
  }
}

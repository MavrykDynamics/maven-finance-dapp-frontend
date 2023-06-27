import { gql } from 'utils/__generated__'

export const SATELLITE_TOTAL_VOTING_POWER_SUBSCRIPTION = gql(`
subscription satelliteGovernanceCycle($satelliteAddress: String) {
  governance {
    satellite_snapshots(order_by: {cycle: desc_nulls_last},limit: 1, where: {user :{address: {_eq: $satelliteAddress}}}) {
      cycle
      total_voting_power
    }
    cycle_id
  }
}
`)

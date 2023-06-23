export const SATELLITE_GOVERNANCE_STORAGE_QUERY = `
  query GetGovernanceSatelliteStorageQuery {
    governance_satellite {
      address
      admin
      gov_sat_approval_percentage
      gov_sat_duration_in_days
      governance {
        address
      }
      governance_satellite_counter
      max_actions_per_satellite
    }

    governance_satellite_action(order_by: {expiration_datetime: desc}) {
      executed
      expiration_datetime
      governance_purpose
      governance_satellite {
        address
      }
      governance_type
      id
      initiator {
        address
      }
      nay_vote_smvk_total
      pass_vote_smvk_total
      smvk_percentage_for_approval
      smvk_required_for_approval
      snapshot_smvk_total_supply
      start_datetime
      status
      yay_vote_smvk_total

      parameters {
        name
        value
        id
        governance_satellite_action_id

        governance_satellite_action {
          executed
          expiration_datetime
          governance_purpose
          governance_satellite_id
          governance_type
          id
          initiator_id
          nay_vote_smvk_total
          pass_vote_smvk_total
          smvk_percentage_for_approval
          smvk_required_for_approval
          snapshot_smvk_total_supply
          start_datetime
          status
          yay_vote_smvk_total
        }
      }

      votes {
        governance_satellite_action_id
        id
        timestamp
        vote
        voter {
          address
        }
      }
    }
  }
`

export const SATELLITE_GOVERNANCE_STORAGE_QUERY_NAME = 'GetGovernanceSatelliteStorageQuery'
export const SATELLITE_GOVERNANCE_STORAGE_QUERY_VARIABLE = {}

// actions max count
// TODO add cycle_id when it will be ready (right now it takes all actions from cycles)
export const SATELLITE_ACTIONS_COUNT_QUERY = `
query maxSatGovActionsPerSatellitePerCycle($address:String = "") {
  governance_satellite {
    actions(where: {initiator: {address: {_eq: $address}}, status: {_eq: "0"}}, order_by: {expiration_datetime: desc}) {
      status
    }
  }
}
`
export const SATELLITE_ACTIONS_COUNT_QUERY_NAME = 'maxSatGovActionsPerSatellitePerCycle'
export function SATELLITE_ACTIONS_COUNT_QUERY_VARIABLE(address: string) {
  return { address: address }
}

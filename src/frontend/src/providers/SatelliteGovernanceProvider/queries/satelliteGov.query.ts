import { gql } from 'utils/__generated__'

export const SATELLITE_GOVERNANCE_CONFIG_QUERY = gql(`
  query GetGovernanceSatelliteConfig {
    governance_satellite: governance_satellite {
      address
      admin
      approval_percentage
      sat_action_duration_in_days
      governance {
        address
      }
      governance_satellite_counter
      max_actions_per_satellite
    }
  }
`)

export const ONGOING_SATELLITES_GOVERNANCE_ACTIONS_QUERY = gql(`
  query ongoingGovernanceSatelliteActionsQuery($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z") {
    governance_satellite_action: governance_satellite_action(order_by: {expiration_datetime: desc}, where: {executed: {_eq: false}, expiration_datetime: {_gt: $currentTimestamp}}) {
      executed
      expiration_datetime
      execution_datetime
      dropped_datetime
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
`)

export const PAST_SATELLITES_GOVERNANCE_ACTIONS_QUERY = gql(`
  query pastGovernanceSatelliteActionsQuery($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z") {
    governance_satellite_action: governance_satellite_action(order_by: {expiration_datetime: desc}, where: {_or: [{_and: [{executed: {_eq: false}}, {status: {_eq: "1"}}]}, {_and: [{executed: {_eq: true}}, {execution_datetime: {_lt: $currentTimestamp}}]}]}) {
      executed
      expiration_datetime
      execution_datetime
      dropped_datetime
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
`)

export const USER_SATELLITES_GOVERNANCE_ACTIONS_QUERY = gql(`
  query userGovernanceSatelliteActionsQuery($userAddress: String = "") {
    governance_satellite_action: governance_satellite_action(order_by: {expiration_datetime: desc}, where: {initiator: {address: {_eq: $userAddress}}}) {
      executed
      expiration_datetime
      execution_datetime
      dropped_datetime
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
`)

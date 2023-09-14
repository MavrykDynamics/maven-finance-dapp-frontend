import { gql as apolloGql, OperationVariables, TypedDocumentNode } from '@apollo/client'
import { DocumentNode } from 'graphql'

// classes
import { ValidationError } from 'errors/error'

// types
import { gql } from 'utils/__generated__'
import { GetGovernanceSatelliteActionsDataQuery } from 'utils/__generated__/graphql'
import { SatelliteGovActionSubsType } from '../satelliteGovernance.provider.types'

// consts
import {
  SATELLITES_GOVERNANCE_ALL_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB,
} from '../helpers/satellitesGov.consts'

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

const getGovernanceActionFilters = (userAddress: string | null, filterType: SatelliteGovActionSubsType | null) => {
  if (userAddress && filterType === SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB) {
    return 'initiator: {address: {_eq: $userAddress}}'
  }

  if (filterType === SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB) {
    return '_or: [{_and: [{executed: {_eq: false}}, {status: {_eq: "1"}}]}, {_and: [{executed: {_eq: true}}, {execution_datetime: {_lt: $currentTimestamp}}]}]'
  }

  if (filterType === SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB) {
    return 'executed: {_eq: false}, expiration_datetime: {_gt: $currentTimestamp}'
  }

  if (filterType === SATELLITES_GOVERNANCE_ALL_ACTIONS_SUB || filterType === null)
    return 'initiator: {address: {_neq: ""}}'

  throw new ValidationError('Governance actions filter error', {
    code: 400,
  })
}

// TODO: check refetch work & check tab change new query provoke
export const getGovernanceActionsQuery = (
  userAddress: string | null,
  filterType: SatelliteGovActionSubsType | null,
): DocumentNode | TypedDocumentNode<GetGovernanceSatelliteActionsDataQuery, OperationVariables> => {
  const filterQuery = getGovernanceActionFilters(userAddress, filterType)

  return apolloGql(`
  query GetGovernanceSatelliteActionsData($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z", $userAddress: String = "") {
    governance_satellite_action: governance_satellite_action(order_by: {expiration_datetime: desc}, where: {${filterQuery}}) {
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
}

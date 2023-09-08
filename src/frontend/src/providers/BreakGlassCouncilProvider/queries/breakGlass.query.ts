import { DocumentNode, OperationVariables, TypedDocumentNode, gql as apolloGql } from '@apollo/client'
import { gql } from 'utils/__generated__'
import { GetPastBreakGlassCouncilActionsQuery } from 'utils/__generated__/graphql'
import { BreakGlassCouncilActionsSubsType } from '../breakGlassCouncil.types'
import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  MY_BG_ONGOING_COUNCIL_ACTIONS_SUB,
} from '../helpers/breakGlassCouncil.consts'

export const BREAK_GLASS_COUNCIL_MEMBERS_QUERY = gql(`
  query GetBreakGlassCouncilMembers {
    break_glass_council_member {
      user {
        address
      }
      name
      break_glass {
        address
      }
      website
      image
      id
    }
  }
`)

function getBreakGlassCouncilActionsFilter(actionType: BreakGlassCouncilActionsSubsType, userAddress: string) {
  switch (actionType) {
    case ALL_BG_PAST_COUNCIL_ACTIONS_SUB:
      return 'expiration_datetime: {_lt: $currentTimestamp}, _or: {executed: {_eq: true}'
    case ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB:
      return 'expiration_datetime: {_gt: $currentTimestamp}, _or: {executed: {_eq: false}'
  }
}

export const getBreakGlassCouncilActions = (
  actionType: BreakGlassCouncilActionsSubsType,
  userAddress: string,
): DocumentNode | TypedDocumentNode<GetPastBreakGlassCouncilActionsQuery, OperationVariables> => {
  const filterCondition = getBreakGlassCouncilActionsFilter(actionType, userAddress)

  return apolloGql(`
  query GetPastBreakGlassCouncilActions($currentTimestamp: timestamptz = '1970-01-01T00:00:00.000Z'){
    break_glass_action(where: {${filterCondition}}, order_by: {start_datetime: desc}) {
      action_type
      break_glass {
        address
      }
      executed
      council_size_snapshot
      id
      initiator {
        address
      }
      signers_count
      start_datetime
      parameters {
        id
        name
        value
      }
    }
  }
  `)
}

// export const BREAK_GLASS_COUNCIL_MEMBERS_QUERY_NAME = 'GetBreakGlassCouncilMemberQuery'
// export const BREAK_GLASS_COUNCIL_MEMBERS_QUERY_VARIABLE = {}

// const BREAK_GLASS_ACTIONS_PARAMS = `

// `

// export const BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY = `
//   query GetPastBreakGlassCouncilActions($_lt: timestamptz = "") {
//     break_glass_action(where: {expiration_datetime: {_lt: $_lt}, _or: {executed: {_eq: true}}}, order_by: {start_datetime: desc}) {
//      ${BREAK_GLASS_ACTIONS_PARAMS}
//     }
//   }
// `

// export const BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_NAME = 'GetPastBreakGlassCouncilActions'
// export function BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_VARIABLE(variables: { _lt?: string }) {
//   return variables
// }

// export const BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY = `
//   query GetPendingBreakGlassCouncilActions($_gte: timestamptz = "", $userAddress: String = "", $userAddress2: String = "") {
//     break_glass_action(where: {expiration_datetime: {_gte: $_gte}, _or: {executed: {_eq: false}}, initiator: {address: {_neq: $userAddress}}, signers: {signer: {address: {_neq: $userAddress2}}}}, order_by: {start_datetime: desc}) {
//       ${BREAK_GLASS_ACTIONS_PARAMS}
//     }
//   }
// `

// export const BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_NAME = 'GetPendingBreakGlassCouncilActions'
// export function BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_VARIABLE(variables: { _gte?: string }) {
//   return variables
// }

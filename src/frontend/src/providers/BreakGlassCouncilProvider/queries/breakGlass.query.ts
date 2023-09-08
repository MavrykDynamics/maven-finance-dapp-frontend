import { DocumentNode, OperationVariables, TypedDocumentNode, gql as apolloGql } from '@apollo/client'
import { gql } from 'utils/__generated__'
import { GetPastBreakGlassCouncilActionsQuery } from 'utils/__generated__/graphql'
import { BreakGlassCouncilActionsSubsType } from '../breakGlassCouncil.types'
import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  MY_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
} from '../helpers/breakGlassCouncil.consts'
import { ValidationError } from 'errors/error'

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

function getBreakGlassCouncilActionsFilter(actionType: BreakGlassCouncilActionsSubsType) {
  switch (actionType) {
    case ALL_BG_PAST_COUNCIL_ACTIONS_SUB:
      return 'expiration_datetime: {_lt: $currentTimestamp}, _or: {executed: {_eq: true}}'
    case ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB:
      return 'expiration_datetime: {_gt: $currentTimestamp}, _or: {executed: {_eq: false}}'
    case MY_BG_ONGOING_COUNCIL_ACTIONS_SUB:
      return 'expiration_datetime: {_gt: $currentTimestamp}, _or: {executed: {_eq: false}, initiator: {address: {_eq: $userAddress}}}'
    case MY_BG_PAST_COUNCIL_ACTIONS_SUB:
      return 'expiration_datetime: {_lt: $currentTimestamp}, _or: {executed: {_eq: true}, initiator: {address: {_eq: $userAddress}}}'
    default:
      throw new ValidationError('Break Glass actions filter error', {
        code: 400,
      })
  }
}

export const getBreakGlassCouncilActions = (
  actionType: BreakGlassCouncilActionsSubsType,
): DocumentNode | TypedDocumentNode<GetPastBreakGlassCouncilActionsQuery, OperationVariables> => {
  const filterCondition = getBreakGlassCouncilActionsFilter(actionType)

  return apolloGql(`
  query GetPastBreakGlassCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z", $userAddress: String = ""){
    break_glass_action(order_by: {start_datetime: desc}, where: {${filterCondition}}) {
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

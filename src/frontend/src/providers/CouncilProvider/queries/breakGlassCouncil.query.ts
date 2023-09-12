import { DocumentNode, OperationVariables, TypedDocumentNode, gql as apolloGql } from '@apollo/client'

// utils
import { gql } from 'utils/__generated__'

// types
import { GetBreakGlassCouncilActionsQuery } from 'utils/__generated__/graphql'
import { CouncilSubsRecordType } from '../council.provider.types'

// consts
import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  BG_COUNCIL_ACTIONS_DATA,
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
} from '../helpers/council.consts'

export const BREAK_GLASS_COUNCIL_MEMBERS_QUERY = gql(`
  query GetBreakGlassCouncilMembers {
    break_glass_council_member {
      name
      website
      image
      id
      user {
        address
      }
    }
  }
`)

function getBreakGlassCouncilActionsFilter(actionType: CouncilSubsRecordType[typeof BG_COUNCIL_ACTIONS_DATA]) {
  switch (actionType) {
    case ALL_BG_PAST_COUNCIL_ACTIONS_SUB:
      return 'expiration_datetime: {_lt: $currentTimestamp}, _or: {executed: {_eq: true}}'
    case ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB:
      return 'expiration_datetime: {_gt: $currentTimestamp}, _or: {executed: {_eq: false}}'
    case MY_BG_PAST_COUNCIL_ACTIONS_SUB:
      return `_or: [
        {_and: [
          {_or: [
            {execution_datetime: {
              _lt: $currentTimestamp
            }
            }, 
            {
              executed: {
                _eq: true
              }
            }
          ]},
          {
            initiator: {address: {_eq: $userAddress}}
          }
        ]},
        {_and: [
          {_and: [
            {execution_datetime: {
              _gt: $currentTimestamp
            }
            }, 
            {
              executed: {
                _eq: false
              }
            }
          ]},
          {
            initiator: {address: {_neq: $userAddress}}
          }
        ]}]`
    default:
      return ''
  }
}

export const getBreakGlassCouncilActions = (
  actionType: CouncilSubsRecordType[typeof BG_COUNCIL_ACTIONS_DATA],
): DocumentNode | TypedDocumentNode<GetBreakGlassCouncilActionsQuery, OperationVariables> => {
  const filterCondition = getBreakGlassCouncilActionsFilter(actionType)

  return apolloGql(`
    query GetBreakGlassCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z", $userAddress: String = ""){
      break_glass_action(order_by: {start_datetime: desc}, where: {${filterCondition}}) {
        action_type
        signers_count
        start_datetime
        executed
        council_size_snapshot
        expiration_datetime
        id
        initiator {
          address
        }
        break_glass {
          address
        }
        parameters {
          id
          name
          value
        }
      }
    }
  `)
}

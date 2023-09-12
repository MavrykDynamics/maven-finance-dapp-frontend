import { DocumentNode, OperationVariables, TypedDocumentNode, gql as apolloGql } from '@apollo/client'

// utils
import { gql } from 'utils/__generated__'

// types
import { GetCouncilActionsQuery } from 'utils/__generated__/graphql'
import { CouncilSubsRecordType } from '../council.provider.types'

// consts
import {
  ALL_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_PAST_COUNCIL_ACTIONS_SUB,
  COUNCIL_ACTIONS_DATA,
  MY_PAST_COUNCIL_ACTIONS_SUB,
} from '../helpers/council.consts'

export const COUNCIL_MEMBERS_QUERY = gql(`
  query GetCouncilMembers {
    council {
      members {
        id
        name
        image
        website
        user {
          address
        }
      }
    }
  }
`)

function getCouncilActionsFilter(actionType: CouncilSubsRecordType[typeof COUNCIL_ACTIONS_DATA]) {
  switch (actionType) {
    case ALL_PAST_COUNCIL_ACTIONS_SUB:
      return 'expiration_datetime: {_lt: $currentTimestamp}, _or: {executed: {_eq: true}}'
    case ALL_ONGOING_COUNCIL_ACTIONS_SUB:
      return 'status: {_eq: "0"}, expiration_datetime: {_gt: $currentTimestamp}, _or: {executed: {_eq: false}}'
    case MY_PAST_COUNCIL_ACTIONS_SUB:
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

export const getCouncilActions = (
  actionType: CouncilSubsRecordType[typeof COUNCIL_ACTIONS_DATA],
): DocumentNode | TypedDocumentNode<GetCouncilActionsQuery, OperationVariables> => {
  const filterCondition = getCouncilActionsFilter(actionType)

  return apolloGql(`
    query GetCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z", $userAddress: String = ""){
        council_action(order_by: {start_datetime: desc}, where: {${filterCondition}}) {
        action_type
        executed
        council_size_snapshot
        id
        signers_count
        start_datetime
        expiration_datetime
        council {
          address
        }
        initiator {
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

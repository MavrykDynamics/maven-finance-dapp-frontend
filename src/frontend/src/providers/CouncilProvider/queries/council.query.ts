import { DocumentNode, OperationVariables, TypedDocumentNode, gql as apolloGql } from '@apollo/client'
import { gql } from 'utils/__generated__'
import { GetCouncilActionsQuery } from 'utils/__generated__/graphql'
import { CouncilSubsRecordType } from '../council.provider.types'
import {
  ALL_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_PAST_COUNCIL_ACTIONS_SUB,
  COUNCIL_ACTIONS_DATA,
  MY_ONGOING_COUNCIL_ACTIONS_SUB,
  MY_PAST_COUNCIL_ACTIONS_SUB,
} from '../helpers/council.consts'
import { ValidationError } from 'errors/error'

export const COUNCIL_MEMBERS_QUERY = gql(`
  query GetCouncilMembers {
    council {
      members {
        user {
          address
        }
        id
        name
        image
        website
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
    case MY_ONGOING_COUNCIL_ACTIONS_SUB:
      return 'status: {_eq: "0"}, expiration_datetime: {_gt: $currentTimestamp}, _or: {executed: {_eq: false}, initiator: {address: {_eq: $userAddress}}}'
    case MY_PAST_COUNCIL_ACTIONS_SUB:
      return 'expiration_datetime: {_lt: $currentTimestamp}, _or: {executed: {_eq: true}, initiator: {address: {_eq: $userAddress}}}'
    default:
      throw new ValidationError('Council actions filter error', {
        code: 400,
      })
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
        council {
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

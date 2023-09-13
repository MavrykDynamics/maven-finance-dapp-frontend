import { gql } from 'utils/__generated__'

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

export const ALL_BG_PAST_COUNSILS_QUERY = gql(`
  query GetBgAllPastCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z"){
    break_glass_action(order_by: {start_datetime: desc}, where: {_or: [{expiration_datetime: {_lt: $currentTimestamp}}, {executed: {_eq: true}}]}) {
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

export const ALL_BG_ONGOING_COUNSILS_QUERY = gql(`
  query GetBgAllOngoingCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z"){
    break_glass_action(order_by: {start_datetime: desc}, where: {status: {_eq: "0"}, expiration_datetime: {_gt: $currentTimestamp}, executed: {_eq: false}}) {
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

export const MY_BG_PAST_COUNSILS_QUERY = gql(`
  query GetBgMyPastCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z", $userAddress: String = ""){
    break_glass_action(order_by: {start_datetime: desc}, where: {_or: [
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
      ]}]}) {
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

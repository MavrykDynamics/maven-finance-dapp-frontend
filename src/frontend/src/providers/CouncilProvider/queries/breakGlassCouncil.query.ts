import { gql } from 'utils/__generated__'

export const BREAK_GLASS_COUNCIL_MEMBERS_QUERY = gql(`
  query GetBreakGlassCouncilMembers {
    break_glass_council_member: break_glass_council_member {
      name
      website
      image
      id
      user {
        address
        satellites {
          status
          currently_registered
        }
      }
    }
  }
`)

export const ALL_BG_PAST_COUNCILS_QUERY = gql(`
  query GetBgAllPastCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z"){
    break_glass_action: break_glass_action(order_by: {start_datetime: desc}, where: {_or: [{expiration_datetime: {_lt: $currentTimestamp}}, {status: {_in: ["1", "2"]}}]}) {
      action_type
      signers_count
      start_datetime
      executed
      status
      council_size_snapshot
      expiration_datetime
      id
      initiator {
        address
      }
      break_glass {
        address
      }
      signers {
        signer {
          address
        }
      }
      parameters {
        id
        name
        value
      }
    }
  }
`)

export const ALL_BG_ONGOING_COUNCILS_QUERY = gql(`
  query GetBgAllOngoingCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z"){
    break_glass_action: break_glass_action(order_by: {start_datetime: desc}, where: {status: {_eq: "0"}, expiration_datetime: {_gt: $currentTimestamp}}) {
      action_type
      signers_count
      start_datetime
      executed
      status
      council_size_snapshot
      expiration_datetime
      id
      initiator {
        address
      }
      break_glass {
        address
      }
      signers {
        signer {
          address
        }
      }
      parameters {
        id
        name
        value
      }
    }
  }
`)

export const MY_BG_PAST_COUNCILS_QUERY = gql(`
  query GetBgMyPastCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z", $userAddress: String = ""){
    break_glass_action: break_glass_action(order_by: {start_datetime: desc}, where: {_or: [
      {_and: [
        {_or: [
          {expiration_datetime: {_lt: $currentTimestamp}}, 
          {status: {_in: ["1", "2"]}}
        ]},
        {
          initiator: {address: {_eq: $userAddress}}
        }
      ]},
      {_and: [
        {_and: [
          {expiration_datetime: {_gt: $currentTimestamp}}, 
          {status: {_eq: "0"}}
        ]},
        {
          initiator: {address: {_neq: $userAddress}}
        }
      ]}
    ]}) {
      action_type
      signers_count
      start_datetime
      executed
      status
      council_size_snapshot
      expiration_datetime
      id
      initiator {
        address
      }
      break_glass {
        address
      }
      signers {
        signer {
          address
        }
      }
      parameters {
        id
        name
        value
      }
    }
  }
`)

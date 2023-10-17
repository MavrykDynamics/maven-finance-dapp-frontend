import { gql } from 'utils/__generated__'

export const COUNCIL_MEMBERS_QUERY = gql(`
  query GetCouncilMembers {
    council: council {
      members {
        id
        name
        image
        website
        user {
          address
          satellites {
            status
            currently_registered
          }
        }
      }
    }
  }
`)

export const ALL_PAST_COUNSILS_QUERY = gql(`
  query GetAllPastCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z"){
    council_action: council_action(order_by: {start_datetime: desc}, where: {_or: [{expiration_datetime: {_lt: $currentTimestamp}}, {executed: {_eq: true}}]}) {
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

export const ALL_ONGOING_COUNSILS_QUERY = gql(`
  query GetAllOngoingCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z"){
    council_action: council_action(order_by: {start_datetime: desc}, where: {status: {_eq: "0"}, expiration_datetime: {_gt: $currentTimestamp}, executed: {_eq: false}}) {
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

export const MY_PAST_COUNSILS_QUERY = gql(`
  query GetMyPastCouncilActions($currentTimestamp: timestamptz = "1970-01-01T00:00:00.000Z", $userAddress: String = ""){
    council_action: council_action(order_by: {start_datetime: desc}, where: {_or: [
      {_and: [
        {_or: [
          {expiration_datetime: {
            _lt: $currentTimestamp
          }}, 
          {executed: {
            _eq: true
          }}
        ]},
        {
          initiator: {address: {_eq: $userAddress}}
        }
      ]},
      {_and: [
        {_and: [
          {expiration_datetime: {
            _gt: $currentTimestamp
          }}, 
          {executed: {
            _eq: false
          }}
        ]},
        {
          initiator: {address: {_neq: $userAddress}}
        }
      ]}
    ]}) {
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

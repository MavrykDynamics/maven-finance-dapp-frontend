export const BREAK_GLASS_COUNCIL_MEMBERS_QUERY = `
  query GetBreakGlassCouncilMemberQuery {
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
`
export const BREAK_GLASS_COUNCIL_MEMBERS_QUERY_NAME = 'GetBreakGlassCouncilMemberQuery'
export const BREAK_GLASS_COUNCIL_MEMBERS_QUERY_VARIABLE = {}

const BREAK_GLASS_ACTIONS_PARAMS = `
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
`

export const BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY = `
  query GetPastBreakGlassCouncilActions($_lt: timestamptz = "") {
    break_glass_action(where: {expiration_datetime: {_lt: $_lt}, _or: {executed: {_eq: true}}}, order_by: {start_datetime: desc}) {
     ${BREAK_GLASS_ACTIONS_PARAMS}
    }
  }
`

export const BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_NAME = 'GetPastBreakGlassCouncilActions'
export function BREAK_GLASS_COUNCIL_PAST_ACTIONS_QUERY_VARIABLE(variables: { _lt?: string }) {
  return variables
}

export const BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY = `
  query GetPendingBreakGlassCouncilActions($_gte: timestamptz = "", $userAddress: String = "", $userAddress2: String = "") {
    break_glass_action(where: {expiration_datetime: {_gte: $_gte}, _or: {executed: {_eq: false}}, initiator: {address: {_neq: "$userAddress2"}}, signers: {signer: {address: {_neq: "userAddress2"}}}}, order_by: {start_datetime: desc}) {
      ${BREAK_GLASS_ACTIONS_PARAMS}
    }
  }
`

export const BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_NAME = 'GetPendingBreakGlassCouncilActions'
export function BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_VARIABLE(variables: { _gte?: string }) {
  return variables
}

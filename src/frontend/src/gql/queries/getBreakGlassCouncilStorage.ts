export const BREAK_GLASS_COUNCIL_MEMBERS_QUERY = `
  query GetBreakGlassCouncilMemberQuery {
    break_glass_council_member {
      user_id
      name
      break_glass_id
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
  break_glass_id
  executed
  execution_datetime
  execution_level
  expiration_datetime
  id
  initiator_id
  signers_count
  status
  start_datetime
  signers {
    signer_id
    id
    break_glass_action_id
  }
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
  query GetPendingBreakGlassCouncilActions($_gte: timestamptz = "") {
    break_glass_action(where: {expiration_datetime: {_gte: $_gte}, _or: {executed: {_eq: false}}, initiator_id: {_neq: $userAddress}, signers: { signer_id: {_neq: $userAddress2}}}, order_by: {start_datetime: desc}) {
      ${BREAK_GLASS_ACTIONS_PARAMS}
    }
  }
`

export const BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_NAME = 'GetPendingBreakGlassCouncilActions'
export function BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_VARIABLE(variables: { _gte?: string }) {
  return variables
}

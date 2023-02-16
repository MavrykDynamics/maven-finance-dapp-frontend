export const COUNCIL_STORAGE_QUERY = `
  query GetCouncilStorageQuery {
    council {
      council_member_name_max_length
      council_member_image_max_length
      council_member_website_max_length
      request_purpose_max_length
      request_token_name_max_length
    }

    break_glass {
      glass_broken
    }
  }
`
export const COUNCIL_STORAGE_QUERY_NAME = 'GetCouncilStorageQuery'
export const COUNCIL_STORAGE_QUERY_VARIABLE = {}

export const COUNCIL_MEMBERS_QUERY = `
  query GetCouncilMembers {
    council {
      members {
        id
        name
        image
        user_id
        website
      }
    }
  }
`
export const COUNCIL_MEMBERS_QUERY_NAME = 'GetCouncilMembers'
export const COUNCIL_MEMBERS_QUERY_VARIABLE = {}

const COUNCIL_ACTIONS_PARAMS = `
  council_id
  executed
  execution_datetime
  expiration_datetime
  id
  initiator_id
  signers_count
  start_datetime
  status
  action_type
  parameters {
    id
    name
    value
  }
`

export const COUNCIL_PAST_ACTIONS_QUERY = `
  query GetPastCouncilActions {
    council_action(where: {executed: {_eq: true}}, order_by: {start_datetime: desc}) {
      ${COUNCIL_ACTIONS_PARAMS}
    }
  }
`
export const COUNCIL_PAST_ACTIONS_NAME = 'GetPastCouncilActions'
export const COUNCIL_PAST_ACTIONS_VARIABLE = {}

export const COUNCIL_PENDING_ACTIONS_QUERY = `
  query GetPendingCouncilActions($_gte: timestamptz = "", $userAddress: String = "", $userAddress2: String = "") {
    council_action(where: {status: {_eq: "0"}, expiration_datetime: {_gte: $_gte}, _or: {executed: {_eq: false}}, initiator_id: {_neq: $userAddress}, signers: { signer_id: {_neq: $userAddress2}}}, order_by: {start_datetime: desc}) {
      ${COUNCIL_ACTIONS_PARAMS}
    }
  }
`
export const COUNCIL_PENDING_ACTIONS_NAME = 'GetPendingCouncilActions'
export function COUNCIL_PENDING_ACTIONS_VARIABLE(variables: { _gte?: string }) {
  return variables
}

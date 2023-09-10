// import { CouncilActionType, CouncilMembers } from '../../utils/TypesAndInterfaces/Council'

// export type CouncilState = {
//   councilMembers: CouncilMembers
//   councilActions: {
//     allPendingActions: number[]
//     notMyPendingActions: number[]
//     myPendingActions: number[]
//     allPastActions: number[]
//     myPastActions: number[]
//     actionsMapper: Record<number, CouncilActionType>
//   }
//   breakGlassCouncilMembers: CouncilMembers
//   breakGlassCouncilActions: {
//     allPendingActions: number[]
//     notMyPendingActions: number[]
//     myPendingActions: number[]
//     allPastActions: number[]
//     myPastActions: number[]
//     actionsMapper: Record<number, CouncilActionType>
//   }
// }

// const councilDefaultState: CouncilState = {
//   councilMembers: [],
//   councilActions: {
//     allPendingActions: [],
//     notMyPendingActions: [],
//     myPendingActions: [],
//     allPastActions: [],
//     myPastActions: [],
//     actionsMapper: {},
//   },
//   breakGlassCouncilMembers: [],
//   breakGlassCouncilActions: {
//     allPendingActions: [],
//     notMyPendingActions: [],
//     myPendingActions: [],
//     allPastActions: [],
//     myPastActions: [],
//     actionsMapper: {},
//   },
// }

export const COUNCIL_MEMBERS_QUERY = `
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
`
export const COUNCIL_MEMBERS_QUERY_NAME = 'GetCouncilMembers'
export const COUNCIL_MEMBERS_QUERY_VARIABLE = {}

const COUNCIL_ACTIONS_PARAMS = `
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
    council_action(where: {status: {_eq: "0"}, expiration_datetime: {_gte: $_gte}, _or: {executed: {_eq: false}}, signers: {signer: {address: {_neq: $userAddress2}}}, initiator: {address: {_neq: $userAddress}}}, order_by: {start_datetime: desc}) {
      ${COUNCIL_ACTIONS_PARAMS}
    }
  }
`
export const COUNCIL_PENDING_ACTIONS_NAME = 'GetPendingCouncilActions'
export function COUNCIL_PENDING_ACTIONS_VARIABLE(variables: { _gte?: string }) {
  return variables
}

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
    break_glass_action(where: {expiration_datetime: {_gte: $_gte}, _or: {executed: {_eq: false}}, initiator: {address: {_neq: $userAddress}}, signers: {signer: {address: {_neq: $userAddress2}}}}, order_by: {start_datetime: desc}) {
      ${BREAK_GLASS_ACTIONS_PARAMS}
    }
  }
`

export const BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_NAME = 'GetPendingBreakGlassCouncilActions'
export function BREAK_GLASS_COUNCIL_PENDING_ACTIONS_QUERY_VARIABLE(variables: { _gte?: string }) {
  return variables
}

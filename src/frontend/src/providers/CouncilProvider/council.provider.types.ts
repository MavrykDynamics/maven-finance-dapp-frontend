import { normalizeCouncilActions, normalizeCouncilMembers, normalizeCouncilAction } from './helpers/council.normalizer'
import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  ALL_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_PAST_COUNCIL_ACTIONS_SUB,
  BG_COUNCIL_ACTIONS_DATA,
  BG_COUNCIL_MEMBERS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
  MY_PAST_COUNCIL_ACTIONS_SUB,
} from './helpers/council.consts'
import {
  GetAllOngoingCouncilActionsQuery,
  GetAllPastCouncilActionsQuery,
  GetBgAllOngoingCouncilActionsQuery,
  GetBgAllPastCouncilActionsQuery,
  GetBgMyPastCouncilActionsQuery,
  GetMyPastCouncilActionsQuery,
} from 'utils/__generated__/graphql'

// ----- normalizer types
export type CouncilActionType = {
  actionType: string
  executed: boolean
  id: number
  initiatorAddress: string
  signersCount: number
  startDatetime: string | null
  expirationTime: string | null
  parameters: Array<{ id: number; name: string; value: string }>
  councilSize: number
  counsilAddress: string
}
export type CouncilMembersType = ReturnType<typeof normalizeCouncilMembers>
export type CouncilActionsType = ReturnType<typeof normalizeCouncilActions>

// ----- queries types
export type CounsilActionsQueryType =
  | GetMyPastCouncilActionsQuery
  | GetAllPastCouncilActionsQuery
  | GetAllOngoingCouncilActionsQuery
export type BgCounsilActionsQueryType =
  | GetBgMyPastCouncilActionsQuery
  | GetBgAllPastCouncilActionsQuery
  | GetBgAllOngoingCouncilActionsQuery

// ----- counsils subs types
export type BreakGlassCouncilActionsSubsType =
  | typeof MY_BG_PAST_COUNCIL_ACTIONS_SUB
  | typeof ALL_BG_PAST_COUNCIL_ACTIONS_SUB
  | typeof ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB

export type CouncilActionsSubsType =
  | typeof MY_PAST_COUNCIL_ACTIONS_SUB
  | typeof ALL_PAST_COUNCIL_ACTIONS_SUB
  | typeof ALL_ONGOING_COUNCIL_ACTIONS_SUB

export type CouncilSubsRecordType = {
  [BG_COUNCIL_ACTIONS_DATA]: BreakGlassCouncilActionsSubsType | null
  [COUNCIL_ACTIONS_DATA]: CouncilActionsSubsType | null
  [COUNCIL_MEMBERS_SUB]: boolean
  [BG_COUNCIL_MEMBERS_SUB]: boolean
}

// ----- counsils context types
export type CouncilActionsRecordType = {
  allPendingActions: CouncilActionsType['allPendingActions']
  notMyPendingActions: CouncilActionsType['notMyPendingActions']
  myPendingActions: CouncilActionsType['myPendingActions']
  allPastActions: CouncilActionsType['allPastActions']
  myPastActions: CouncilActionsType['myPastActions']
  actionsMapper: CouncilActionsType['actionsMapper']
}
export type NullableCouncilActionsRecordType = DeepDeepNullable<CouncilActionsRecordType>

export type CouncilStateType = {
  breakGlassCouncilMembers: CouncilMembersType
  councilMembers: CouncilMembersType
  councilActions: CouncilActionsRecordType
  breakGlassCouncilActions: CouncilActionsRecordType
}

export type NullableCouncilContextStateType = DeepDeepNullable<CouncilStateType>

export type CouncilContext = CouncilStateType & {
  isLoading: boolean
  changeCouncilSubscriptionList: (subs: Partial<CouncilSubsRecordType>) => void
}

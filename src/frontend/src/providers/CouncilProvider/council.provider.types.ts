import { normalizeCouncilActions, normalizeCouncilMembers, normalizeCouncilAction } from './helpers/council.normalizer'
import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  ALL_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_PAST_COUNCIL_ACTIONS_SUB,
  BG_COUNCIL_ACTIONS_DATA,
  BREAK_GLASS_COUNCIL_MEMBERS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
  MY_PAST_COUNCIL_ACTIONS_SUB,
} from './helpers/council.consts'

// normalizer types
export type CouncilMembersType = ReturnType<typeof normalizeCouncilMembers>
export type CouncilActionType = ReturnType<typeof normalizeCouncilAction>
export type CouncilActionsType = ReturnType<typeof normalizeCouncilActions>

// -------- provider types

// counsils subs types
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
  [BREAK_GLASS_COUNCIL_MEMBERS_SUB]: boolean
}

// counsils data type
export type CouncilActionsRecordType = {
  allPendingActions: CouncilActionsType['allPendingActions']
  notMyPendingActions: CouncilActionsType['notMyPendingActions']
  myPendingActions: CouncilActionsType['myPendingActions']
  allPastActions: CouncilActionsType['allPastActions']
  myPastActions: CouncilActionsType['myPastActions']
  actionsMapper: CouncilActionsType['actionsMapper']
}
export type NullableCouncilActionsRecordType = DeepNullable<CouncilActionsRecordType>

export type CouncilStateType = {
  breakGlassCouncilMembers: CouncilMembersType
  councilMembers: CouncilMembersType
  councilActions: DeepNullable<CouncilActionsRecordType>
  breakGlassCouncilActions: DeepNullable<CouncilActionsRecordType>
}

export type NullableCouncilContextStateType = DeepNullable<
  Exclude<CouncilStateType, 'councilActions' | 'breakGlassCouncilActions'>
> &
  Pick<CouncilStateType, 'breakGlassCouncilActions' | 'councilActions'>

export type CouncilContext = CouncilStateType & {
  isLoading: boolean
  changeCouncilSubscriptionList: (subs: Partial<CouncilSubsRecordType>) => void
}

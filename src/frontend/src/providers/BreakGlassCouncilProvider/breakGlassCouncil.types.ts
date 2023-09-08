import { normalizeCouncilActions, normalizeCouncilMembers } from './helpers/breakGlass.normalizer'
import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  BG_COUNCIL_ACTIONS_DATA,
  MY_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
} from './helpers/breakGlassCouncil.consts'

// normalizer types
export type BreakGlassCouncilMembersType = ReturnType<typeof normalizeCouncilMembers>
export type BreakGlassCouncilActionsType = ReturnType<typeof normalizeCouncilActions>

// subs consts type
export type BreakGlassCouncilActionsSubsType =
  | typeof MY_BG_PAST_COUNCIL_ACTIONS_SUB
  | typeof MY_BG_ONGOING_COUNCIL_ACTIONS_SUB
  | typeof ALL_BG_PAST_COUNCIL_ACTIONS_SUB
  | typeof ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB

// active subs record type (allow only one sub at the time)
export type BreakGlassCouncilSubsRecordType = {
  [BG_COUNCIL_ACTIONS_DATA]: BreakGlassCouncilActionsSubsType | null
}

export type BreakGlassCouncilStateType = {
  breakGlassCouncilMembers: BreakGlassCouncilMembersType
  allPendingActions: BreakGlassCouncilActionsType['allPendingActions']
  notMyPendingActions: BreakGlassCouncilActionsType['notMyPendingActions']
  myPendingActions: BreakGlassCouncilActionsType['myPendingActions']
  allPastActions: BreakGlassCouncilActionsType['allPastActions']
  myPastActions: BreakGlassCouncilActionsType['myPastActions']
  actionsMapper: BreakGlassCouncilActionsType['actionsMapper']
}

export type NullableBreakGlassCouncilContextStateType = DeepNullable<BreakGlassCouncilStateType>

export type BreakGlassCouncilContext = BreakGlassCouncilStateType & {
  isLoading: boolean

  changeBreakGlassCouncilSubscriptionList: (subs: Partial<BreakGlassCouncilSubsRecordType>) => void
}

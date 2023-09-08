import { normalizeCouncilActions, normalizeCouncilMembers } from './helpers/council.normalizer'
import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  ALL_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_PAST_COUNCIL_ACTIONS_SUB,
  BG_COUNCIL_ACTIONS_DATA,
  BREAK_GLASS_COUNCIL_MEMBERS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  MY_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
  MY_ONGOING_COUNCIL_ACTIONS_SUB,
  MY_PAST_COUNCIL_ACTIONS_SUB,
} from './helpers/council.consts'

// normalizer types
export type CouncilMembersType = ReturnType<typeof normalizeCouncilMembers>
export type CouncilActionsType = ReturnType<typeof normalizeCouncilActions>

// subs consts type
export type BreakGlassCouncilActionsSubsType =
  | typeof MY_BG_PAST_COUNCIL_ACTIONS_SUB
  | typeof MY_BG_ONGOING_COUNCIL_ACTIONS_SUB
  | typeof ALL_BG_PAST_COUNCIL_ACTIONS_SUB
  | typeof ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB

export type CouncilActionsSubsType =
  | typeof MY_PAST_COUNCIL_ACTIONS_SUB
  | typeof MY_ONGOING_COUNCIL_ACTIONS_SUB
  | typeof ALL_PAST_COUNCIL_ACTIONS_SUB
  | typeof ALL_ONGOING_COUNCIL_ACTIONS_SUB

// active subs record type (allow only one sub at the time)
export type CouncilSubsRecordType = {
  [BG_COUNCIL_ACTIONS_DATA]: BreakGlassCouncilActionsSubsType | null
  [COUNCIL_ACTIONS_DATA]: CouncilActionsSubsType | null
} & {
  [COUNCIL_MEMBERS_SUB]: boolean
  [BREAK_GLASS_COUNCIL_MEMBERS_SUB]: boolean
}

export type CouncilActionsRecordType = {
  allPendingActions: CouncilActionsType['allPendingActions']
  notMyPendingActions: CouncilActionsType['notMyPendingActions']
  myPendingActions: CouncilActionsType['myPendingActions']
  allPastActions: CouncilActionsType['allPastActions']
  myPastActions: CouncilActionsType['myPastActions']
  actionsMapper: CouncilActionsType['actionsMapper']
}

export type NullableActionsDataType = TupleKeyValueAny<string, CouncilActionsRecordType | null>

export type CouncilStateType = {
  breakGlassCouncilMembers: CouncilMembersType
  councilMembers: CouncilMembersType
  councilActions: CouncilActionsRecordType
  breakGlassCouncilActions: CouncilActionsRecordType
}

export type NullableCouncilContextStateType = DeepNullable<
  Omit<CouncilStateType, 'councilActions' | 'breakGlassCouncilActions'> & {
    councilActions: NullableActionsDataType
    breakGlassCouncilActions: NullableActionsDataType
  }
>

export type CouncilContext = CouncilStateType & {
  isCouncilLoading: boolean
  isBreakGlassCouncilLoading: boolean

  changeCouncilSubscriptionList: (subs: Partial<CouncilSubsRecordType>) => void
}

import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  BG_COUNCIL_ACTIONS_DATA,
  MY_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
} from './helpers/breakGlassCouncil.consts'

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

//   export type FinancialRequestsStateType = {
//     allFinRequestsIds: string[]
//     pastFinRequestsIds: string[]
//     ongoingFinRequestsIds: string[]
//     financialRequestsMapper: Record<string, FinancialRequestRecord>
//   }

//   export type NullableFinancialRequestsContextStateType = DeepNullable<FinancialRequestsStateType>

// export type FinancialRequestsContext = FinancialRequestsStateType & {
//   isLoading: boolean

//   changeFinancialRequestsSubscriptionList: (skips: Partial<FinRequestsSubsRecordType>) => void
// }

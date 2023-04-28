// type
import type {
  Doorman,
  Smvk_History_Data,
  Mvk_Token,
  Mvk_Transfer_History_Data,
} from '../generated/graphqlTypes'

// conterters
import {
  normalizeDoormanStorage,
  normalizeSmvkHistoryData,
} from '../../pages/Doorman/Doorman.converter'

export interface UserStakeRecord {
  balance: number
  participationFeesPerShare: number
}

export type UserStakeBalanceLedger = Map<string, string>

export type UserStakeRecordsLedger = Map<string, Map<number, UserStakeRecord>>

export interface DoormanBreakGlassConfigType {
  stakeIsPaused: boolean
  unstakeIsPaused: boolean
  compoundIsPaused: boolean
  farmClaimIsPaused: boolean
}

export type DoormanStorage = ReturnType<typeof normalizeDoormanStorage>
export type DoormanGraphQl = Omit<Doorman, '__typename'>

export type MvkTokenGraphQL = Omit<Mvk_Token, '__typename'>

export type SmvkHistoryData = ReturnType<typeof normalizeSmvkHistoryData>
export type SmvkHistoryDataGraphQl = Omit<Smvk_History_Data, '__typename'>


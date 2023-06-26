import React from 'react'

import { normalizeDoormanChartsData } from './helpers/normalizer'

import { STAKE_ACTION, UNSTAKE_ACTION } from './helpers/stake.consts'

export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>
export type StakeActionType = typeof STAKE_ACTION | typeof UNSTAKE_ACTION | ''

export type StakeContext = {
  // data
  mvkHistoryData: SmvkHistoryData['mvkHistoryData']
  smvkHistoryData: SmvkHistoryData['smvkHistoryData']
  totalStakedMvk: number
  totalSupply: number
  maximumTotalSupply: number

  // additional data & methods
  isLoading: boolean
  changeStakingSubscriptionType: (skips: Partial<StakingSubsSkipsType>) => void
  updateStakeActionData: (actionData: Partial<StakingActionData> | null) => void

  // actions
  stakeMVK: (
    amount: number,
    accountPkh: string,
    doormanAddress: string,
    mvkTokenAddress: string,
  ) => Promise<{ actionSuccess: boolean; error: null | unknown }>
  unstakeMVK: (amount: number, doormanAddress: string) => Promise<{ actionSuccess: boolean; error: null | unknown }>
}

export type StakeContextStateType = Pick<
  StakeContext,
  'totalStakedMvk' | 'totalSupply' | 'maximumTotalSupply' | 'mvkHistoryData' | 'smvkHistoryData'
>

export type StakingActionData = {
  loadingToasterId: null | string
  action: StakeActionType
}

export type Props = {
  children: React.ReactNode
}

export type StakingSubsSkipsType = {
  skipStakeHistory?: string
  skipAddressBalance?: string
  skipMvkTokenTotal?: string
  skipUserBalance?: string
}

export type StakingSubsLoadingsType = {
  stakeHistory: boolean
  addressBalance: boolean
  mvkTokenTotal: boolean
  userBalance: boolean
}

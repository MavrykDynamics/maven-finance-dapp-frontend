import React from 'react'

import { normalizeDoormanChartsData } from './helpers/normalizer'

import StakeProvider from './stake.provider'
import { GET_MVK_FROM_FAUCET_ACTION, STAKE_ACTION, UNSTAKE_ACTION } from './helpers/stake.consts'

export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>

export interface StakeContext {
  // action update managers
  action: typeof STAKE_ACTION | typeof UNSTAKE_ACTION | typeof GET_MVK_FROM_FAUCET_ACTION | ''
  updateStakeActionContext: InstanceType<typeof StakeProvider>['updateStakeActionContext']
  loadingToasterId: null | string
  updateStakeLoadingToasterId: InstanceType<typeof StakeProvider>['updateStakeLoadingToasterId']
  // data
  mvkHistoryData: SmvkHistoryData['mvkHistoryData']
  smvkHistoryData: SmvkHistoryData['smvkHistoryData']
  totalStakedMvk: number
  totalSupply: number
  maximumTotalSupply: number
  // methods
  updateStakeHistoryData: InstanceType<typeof StakeProvider>['updateStakeHistoryData']
  updateTotalStakedMvk: InstanceType<typeof StakeProvider>['updateTotalStakedMvk']
  updateTotalMvkToken: InstanceType<typeof StakeProvider>['updateTotalMvkToken']
  // actions
  stakeMVK: InstanceType<typeof StakeProvider>['stakeMVK']
  unstakeMVK: InstanceType<typeof StakeProvider>['unstakeMVK']
  getMVKTokensFromFaucet: InstanceType<typeof StakeProvider>['getMVKTokensFromFaucet']
}

export type State = {
  context: StakeContext
}

export type Props = {
  children: React.ReactNode
}

export type StakingSubsSkipsType = {
  skipStakeHistory?: string
  skipAddressBalance?: string
  skipMvkTokenTotal?: string
}

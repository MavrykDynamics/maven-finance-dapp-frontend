import React from 'react'

import { normalizeDoormanChartsData } from './helpers/normalizer'

import { StakeProviderClass } from './stake.provider'
import { UserState } from 'reducers/wallet'
import { AppDispatch } from 'app/App.controller'
import { STAKE_ACTION, UNSTAKE_ACTION } from './helpers/stake.consts'

export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>

export interface StakeContext {
  // action update managers
  action: typeof STAKE_ACTION | typeof UNSTAKE_ACTION | ''
  updateStakeActionContext: InstanceType<typeof StakeProviderClass>['updateStakeActionContext']
  loadingToasterId: null | string
  updateStakeLoadingToasterId: InstanceType<typeof StakeProviderClass>['updateStakeLoadingToasterId']
  // data
  mvkHistoryData: SmvkHistoryData['mvkHistoryData']
  smvkHistoryData: SmvkHistoryData['smvkHistoryData']
  totalStakedMvk: number
  totalSupply: number
  maximumTotalSupply: number
  // methods
  updateStakeHistoryData: InstanceType<typeof StakeProviderClass>['updateStakeHistoryData']
  updateTotalStakedMvk: InstanceType<typeof StakeProviderClass>['updateTotalStakedMvk']
  updateUserStakeData: InstanceType<typeof StakeProviderClass>['updateUserStakeData']
  updateTotalMvkToken: InstanceType<typeof StakeProviderClass>['updateTotalMvkToken']
  // actions
  stakeMVK: InstanceType<typeof StakeProviderClass>['stakeMVK']
  unstakeMVK: InstanceType<typeof StakeProviderClass>['unstakeMVK']
}

export type State = {
  context: StakeContext
}

export type Props = {
  children: React.ReactNode
  doormanAddress: string
  mvkTokenAddress: string
  accountPkh?: string
  user: UserState
  dispatch: AppDispatch
}

export type StakingSubsSkipsType = {
  skipStakeHistory?: string
  skipAddressBalance?: string
  skipMvkTokenTotal?: string
  skipUserBalance?: string
}

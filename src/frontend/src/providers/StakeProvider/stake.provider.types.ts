import React from 'react'

import { normalizeDoormanChartsData } from './helpers/normalizer'

import { StakeProviderClass } from './stake.provider'
import { UserState } from 'reducers/wallet'
import { AppDispatch } from 'app/App.controller'

export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>

export interface StakeContext {
  action: 'stake' | 'unstake' | ''
  mvkHistoryData: SmvkHistoryData['mvkHistoryData']
  smvkHistoryData: SmvkHistoryData['smvkHistoryData']
  totalStakedMvk: number
  totalSupply: number
  maximumTotalSupply: number
  turnOfActionLoader: boolean
  // methods
  updateStakeHistoryData: InstanceType<typeof StakeProviderClass>['updateStakeHistoryData']
  updateTotalStakedMvk: InstanceType<typeof StakeProviderClass>['updateTotalStakedMvk']
  updateUserStakeData: InstanceType<typeof StakeProviderClass>['updateUserStakeData']
  updateStakeActionContext: InstanceType<typeof StakeProviderClass>['updateStakeActionContext']
  updateTotalMvkToken: InstanceType<typeof StakeProviderClass>['updateTotalMvkToken']
  updateStakeActionLoaderContext: InstanceType<typeof StakeProviderClass>['updateStakeActionLoaderContext']
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

import React from 'react'

import { normalizeDoormanChartsData } from './helpers/normalizer'

import { StakeProviderClass } from './stake.provider'
import { UserState } from 'reducers/wallet'
import { AppDispatch } from 'app/App.controller'
import { StakingActionTypes } from './helpers/stake.consts'

export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>

export interface StakeContext {
  action: StakingActionTypes
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
  getMVKTokensFromFaucet: InstanceType<typeof StakeProviderClass>['getMVKTokensFromFaucet']
}

export type State = {
  context: StakeContext
}

export type Props = {
  children: React.ReactNode
  doormanAddress: string
  mvkTokenAddress: string
  user: UserState
  accountPkh?: string
  dispatch: AppDispatch
}

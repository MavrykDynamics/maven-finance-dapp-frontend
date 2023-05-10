import React from 'react'
import { StakeProviderClass } from './stake.provider'
import { normalizeDoormanChartsData } from './helpers/normalizer'
import { UserState } from 'reducers/wallet'
import { ContractAddressesState } from 'reducers/contractAddresses'
import { Dispatch } from 'redux'
export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>

export interface StakeContext {
  action: 'stake' | 'unstake' | ''
  mvkHistoryData: SmvkHistoryData['mvkHistoryData']
  smvkHistoryData: SmvkHistoryData['smvkHistoryData']
  totalStakedMvk: number
  totalSupply: number
  maximumTotalSupply: number
  // methods
  updateStakeHistoryData: InstanceType<typeof StakeProviderClass>['updateStakeHistoryData']
  updateTotalStakedMvk: InstanceType<typeof StakeProviderClass>['updateTotalStakedMvk']
  updateUserStakeData: InstanceType<typeof StakeProviderClass>['updateUserStakeData']
  updateStakeActionContext: InstanceType<typeof StakeProviderClass>['updateStakeActionContext']
  updateTotalMvkToken: InstanceType<typeof StakeProviderClass>['updateTotalMvkToken']
}

export type State = {
  context: StakeContext
}

export type Props = {
  children: React.ReactNode
  doormanAddress: ContractAddressesState
  accountPkh?: string
  user: UserState
  dispatch: Dispatch
}

import { combineReducers } from 'redux'

import { loading, LoadingState } from './loading'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { emergencyGovernance, EmergencyGovernanceState } from './emergencyGovernance'
import { farm, FarmState } from './farm'
import { contractAddresses, ContractAddressesState } from './contractAddresses'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  contractAddresses,

  emergencyGovernance,

  farm,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  wallet: WalletState
  emergencyGovernance: EmergencyGovernanceState
  farm: FarmState
  contractAddresses: ContractAddressesState
}

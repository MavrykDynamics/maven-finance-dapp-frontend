import { combineReducers } from 'redux'

import { loading, LoadingState } from './loading'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { emergencyGovernance, EmergencyGovernanceState } from './emergencyGovernance'
import { council, CouncilState } from './council'
import { farm, FarmState } from './farm'
import { contractAddresses, ContractAddressesState } from './contractAddresses'

import { satelliteGovernance, SatelliteGovernanceState } from './satelliteGovernance'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  contractAddresses,

  council,
  emergencyGovernance,

  satelliteGovernance,
  farm,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  wallet: WalletState
  emergencyGovernance: EmergencyGovernanceState
  council: CouncilState
  farm: FarmState
  contractAddresses: ContractAddressesState
  satelliteGovernance: SatelliteGovernanceState
}

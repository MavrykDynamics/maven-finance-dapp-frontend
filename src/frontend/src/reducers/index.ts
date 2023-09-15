import { combineReducers } from 'redux'

import { loading, LoadingState } from './loading'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { emergencyGovernance, EmergencyGovernanceState } from './emergencyGovernance'
import { council, CouncilState } from './council'
import { contractAddresses, ContractAddressesState } from './contractAddresses'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  contractAddresses,

  council,
  emergencyGovernance,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  wallet: WalletState
  emergencyGovernance: EmergencyGovernanceState
  council: CouncilState
  contractAddresses: ContractAddressesState
}

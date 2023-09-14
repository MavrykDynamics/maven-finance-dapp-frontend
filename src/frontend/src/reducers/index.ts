import { combineReducers } from 'redux'

import { loading, LoadingState } from './loading'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { governance, GovernanceState } from './governance'
import { emergencyGovernance, EmergencyGovernanceState } from './emergencyGovernance'
import { council, CouncilState } from './council'
import { farm, FarmState } from './farm'
import { contractAddresses, ContractAddressesState } from './contractAddresses'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  contractAddresses,

  governance,
  council,
  emergencyGovernance,

  farm,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  wallet: WalletState
  governance: GovernanceState
  emergencyGovernance: EmergencyGovernanceState
  council: CouncilState
  farm: FarmState
  contractAddresses: ContractAddressesState
}

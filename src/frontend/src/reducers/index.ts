import { combineReducers } from 'redux'

import { loading, LoadingState } from './loading'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { emergencyGovernance, EmergencyGovernanceState } from './emergencyGovernance'
import { treasury, TreasuryState } from './treasury'
import { council, CouncilState } from './council'
import { vesting, VestingState } from './vesting'
import { farm, FarmState } from './farm'
import { contractAddresses, ContractAddressesState } from './contractAddresses'
import { financialRequest, FinancialRequestStoreType } from './financialRequests'
import { satelliteGovernance, SatelliteGovernanceState } from './satelliteGovernance'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  contractAddresses,

  council,
  financialRequest,
  emergencyGovernance,

  satelliteGovernance,
  treasury,
  farm,
  vesting,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  wallet: WalletState
  financialRequest: FinancialRequestStoreType
  emergencyGovernance: EmergencyGovernanceState
  treasury: TreasuryState
  council: CouncilState
  vesting: VestingState
  farm: FarmState
  contractAddresses: ContractAddressesState
  satelliteGovernance: SatelliteGovernanceState
}

import { combineReducers } from 'redux'

import { loading, LoadingState } from './loading'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { governance, GovernanceState } from './governance'
import { emergencyGovernance, EmergencyGovernanceState } from './emergencyGovernance'
import { treasury, TreasuryState } from './treasury'
import { council, CouncilState } from './council'
import { vesting, VestingState } from './vesting'
import { farm, FarmState } from './farm'
import { preferences, PreferencesState } from './preferences'
import { contractAddresses, ContractAddressesState } from './contractAddresses'
import { loans, LoansState } from './loans'
import { financialRequest, FinancialRequestStoreType } from './financialRequests'
import { satelliteGovernance, SatelliteGovernanceState } from './satelliteGovernance'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  preferences,
  contractAddresses,

  governance,
  council,
  financialRequest,
  emergencyGovernance,

  satelliteGovernance,
  loans,
  treasury,
  farm,
  vesting,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  wallet: WalletState
  governance: GovernanceState
  financialRequest: FinancialRequestStoreType
  emergencyGovernance: EmergencyGovernanceState
  treasury: TreasuryState
  council: CouncilState
  vesting: VestingState
  farm: FarmState
  preferences: PreferencesState
  contractAddresses: ContractAddressesState
  loans: LoansState
  satelliteGovernance: SatelliteGovernanceState
}

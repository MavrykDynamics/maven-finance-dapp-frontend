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
import { dataFeeds, DataFeedsState } from './dataFeeds'
import { tokens, TokensType } from './tokens'
import { loans, LoansState } from './loans'
import { financialRequest, FinancialRequestStoreType } from './financialRequests'
import { satellites, SatellitesState } from './satellites'
import { satelliteGovernance, SatelliteGovernanceState } from './satelliteGovernance'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  tokens,
  preferences,
  contractAddresses,

  governance,
  council,
  financialRequest,
  emergencyGovernance,

  satelliteGovernance,
  satellites,
  dataFeeds,

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
  dataFeeds: DataFeedsState
  tokens: TokensType
  loans: LoansState
  satellites: SatellitesState
  satelliteGovernance: SatelliteGovernanceState
}

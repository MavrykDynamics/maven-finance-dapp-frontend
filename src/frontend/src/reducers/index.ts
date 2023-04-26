import { combineReducers } from 'redux'

import { doorman, DoormanState } from './doorman'
import { loading, LoadingState } from './loading'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { governance, GovernanceState } from './governance'
import { emergencyGovernance, EmergencyGovernanceState } from './emergencyGovernance'
import { treasury, TreasuryState } from './treasury'
import { council, CouncilState } from './council'
import { breakGlass, BreakGlassState } from './breakGlass'
import { vesting, VestingState } from './vesting'
import { farm, FarmState } from './farm'
import { preferences, PreferencesState } from './preferences'
import { contractAddresses, ContractAddressesState } from './contractAddresses'
import { dataFeeds, DataFeedsState } from './dataFeeds'
import { tokens, TokensType } from './tokens'
import { loans, LoansState } from './loans'
import { vaults, VaultsStateType } from './vaults'
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
  breakGlass,
  emergencyGovernance,

  satelliteGovernance,
  satellites,
  dataFeeds,

  doorman,
  loans,
  vaults,
  treasury,
  farm,
  vesting,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  wallet: WalletState
  doorman: DoormanState
  governance: GovernanceState
  financialRequest: FinancialRequestStoreType
  emergencyGovernance: EmergencyGovernanceState
  treasury: TreasuryState
  council: CouncilState
  breakGlass: BreakGlassState
  vesting: VestingState
  farm: FarmState
  preferences: PreferencesState
  contractAddresses: ContractAddressesState
  dataFeeds: DataFeedsState
  tokens: TokensType
  loans: LoansState
  vaults: VaultsStateType
  satellites: SatellitesState
  satelliteGovernance: SatelliteGovernanceState
}

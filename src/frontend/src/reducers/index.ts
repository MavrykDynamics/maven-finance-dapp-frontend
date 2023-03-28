import { combineReducers } from 'redux'

import { doorman, DoormanState } from './doorman'
import { loading, LoadingState } from './loading'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { governanceProposals, GovernanceProposalsState } from './governanceProposals'
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
import { governanceConfig, GovernanceConfigState } from './governanceConfig'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  tokens,
  preferences,
  contractAddresses,

  governanceProposals,
  governanceConfig,
  council,
  financialRequest,
  breakGlass,
  emergencyGovernance,

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
  governanceProposals: GovernanceProposalsState
  governanceConfig: GovernanceConfigState
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
}

import { combineReducers } from 'redux'

import { delegation, DelegationState } from './delegation'
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
import { breakGlassCounsil, BreakGlassCounsilState } from './breakGlassCounsil'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  delegation,
  doorman,
  governance,
  emergencyGovernance,
  treasury,
  council,
  breakGlass,
  vesting,
  vaults,
  farm,
  breakGlassCounsil,
  preferences,
  contractAddresses,
  dataFeeds,
  tokens,
  loans,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  wallet: WalletState
  delegation: DelegationState
  doorman: DoormanState
  breakGlassCounsil: BreakGlassCounsilState
  governance: GovernanceState
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
}

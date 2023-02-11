import { combineReducers } from 'redux'

import { delegation, DelegationState } from './delegation'
import { doorman, DoormanState } from './doorman'
import { exitFeeModal, ExitFeeModalState } from './exitFeeModal'
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
import { oracles, OraclesState } from './oracles'
import { tokens, TokensType } from './tokens'
import { loans, LoansState } from './loans'
import { vaults, VaultsStateType } from './vaults'

export const reducers = combineReducers({
  loading,
  toaster,
  exitFeeModal,
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
  preferences,
  contractAddresses,
  oracles,
  tokens,
  loans,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  exitFeeModal: ExitFeeModalState
  wallet: WalletState
  delegation: DelegationState
  doorman: DoormanState
  governance: GovernanceState
  emergencyGovernance: EmergencyGovernanceState
  treasury: TreasuryState
  council: CouncilState
  breakGlass: BreakGlassState
  vesting: VestingState
  farm: FarmState
  preferences: PreferencesState
  contractAddresses: ContractAddressesState
  oracles: OraclesState
  tokens: TokensType
  loans: LoansState
  vaults: VaultsStateType
}

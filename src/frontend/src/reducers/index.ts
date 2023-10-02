import { combineReducers } from 'redux'

import { loading, LoadingState } from './loading'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { farm, FarmState } from './farm'
import { contractAddresses, ContractAddressesState } from './contractAddresses'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  contractAddresses,

  farm,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  wallet: WalletState
  farm: FarmState
  contractAddresses: ContractAddressesState
}

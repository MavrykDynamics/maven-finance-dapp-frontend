import { combineReducers } from 'redux'

import { loading, LoadingState } from './loading'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { contractAddresses, ContractAddressesState } from './contractAddresses'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  contractAddresses,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  wallet: WalletState
  contractAddresses: ContractAddressesState
}

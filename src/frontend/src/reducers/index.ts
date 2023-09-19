import { combineReducers } from 'redux'

import { loading, LoadingState } from './loading'
import { toaster, ToasterState } from './toaster'
import { wallet, WalletState } from './wallet'
import { council, CouncilState } from './council'
import { contractAddresses, ContractAddressesState } from './contractAddresses'

export const reducers = combineReducers({
  loading,
  toaster,
  wallet,
  contractAddresses,

  council,
})

export interface State {
  loading: LoadingState
  toaster: ToasterState
  wallet: WalletState
  council: CouncilState
  contractAddresses: ContractAddressesState
}

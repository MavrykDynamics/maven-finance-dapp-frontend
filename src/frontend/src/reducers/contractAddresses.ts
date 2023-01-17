import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { GET_CONTRACT_ADDRESSES, SET_CONTRACT_ADDRESS } from './actions/contractAddresses.actions'

export interface ContractAddressesState {
  [key: string]: { address: string }
}

const contractAddressesDefaultState: ContractAddressesState = {}

export function contractAddresses(state = contractAddressesDefaultState, action: Action) {
  switch (action.type) {
    case GET_CONTRACT_ADDRESSES:
      return action.addresses
    case SET_CONTRACT_ADDRESS:
      return { ...state, ...action.addressInfo }
    default:
      return state
  }
}

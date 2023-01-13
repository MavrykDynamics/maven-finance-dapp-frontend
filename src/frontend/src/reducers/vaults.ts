import { GET_VAULTS_STORAGE } from 'pages/Vaults/Vaults.actions'
import { VaultGQL } from 'utils/TypesAndInterfaces/Vaults'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type VaultsStateType = {
  vaultsList: Array<VaultGQL>
}
const defaultVaultsState: VaultsStateType = {
  vaultsList: [],
}

export function vaults(state = defaultVaultsState, action: Action) {
  switch (action.type) {
    case GET_VAULTS_STORAGE:
      return {
        ...state,
        vaultsList: action.vaultsList,
      }
    default:
      return state
  }
}

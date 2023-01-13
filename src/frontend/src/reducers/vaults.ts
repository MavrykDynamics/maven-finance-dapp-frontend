import { GET_VAULTS_STORAGE, GET_VAULTS } from 'pages/Vaults/Vaults.actions'
import { VaultGQL, VaultsGQL } from 'utils/TypesAndInterfaces/Vaults'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type VaultsStateType = {
  vaultsList: Array<VaultGQL>
  vaults: Array<VaultsGQL>
}
const defaultVaultsState: VaultsStateType = {
  vaultsList: [],
  vaults: [],
}

export function vaults(state = defaultVaultsState, action: Action) {
  switch (action.type) {
    case GET_VAULTS_STORAGE:
      return {
        ...state,
        vaultsList: action.vaultsList,
      }

    case GET_VAULTS:
      return {
        ...state,
        vaults: action.vaults,
      }
    default:
      return state
  }
}

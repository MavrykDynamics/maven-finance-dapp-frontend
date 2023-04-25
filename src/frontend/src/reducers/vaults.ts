import { GET_VAULTS_STORAGE } from 'pages/Vaults/Vaults.actions'
import { VaultsStorage } from 'utils/TypesAndInterfaces/Vaults'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type VaultsStateType = {
  vaultsList: VaultsStorage
  isLoaded: boolean
}

const defaultVaultsState: VaultsStateType = {
  vaultsList: {
    permissinedVaultsIds: [],
    myVaultsIds: [],
    allVaultsIds: [],
    vaultsMapper: {},
  },
  isLoaded: false,
}

export function vaults(state = defaultVaultsState, action: Action) {
  switch (action.type) {
    case GET_VAULTS_STORAGE:
      return {
        ...state,
        vaultsList: action.vaultsList,
        isLoaded: true,
      }
    default:
      return state
  }
}

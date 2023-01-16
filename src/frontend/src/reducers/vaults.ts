import { GET_VAULTS_STORAGE, GET_VAULTS } from 'pages/Vaults/Vaults.actions'
import { VaultsStorage, VaultsGQL } from 'utils/TypesAndInterfaces/Vaults'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type VaultsStateType = {
  vaultsList: VaultsStorage
  lendingController: Partial<VaultsGQL>
}

const defaultVaultsState: VaultsStateType = {
  vaultsList: {
    myVaultsIds: [],
    allVaultsIds: [],
    vaultsMapper: {}
  },
  lendingController: {}
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
        lendingController: action.vaults,
      }
    default:
      return state
  }
}

import { GET_VAULTS_STORAGE } from 'pages/Vaults/Vaults.actions'
import { VaultsStorage } from 'utils/TypesAndInterfaces/Vaults'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { XtzBakersType } from 'utils/TypesAndInterfaces/Loans'

export type VaultsStateType = {
  vaultsList: VaultsStorage
  xtzBakers: XtzBakersType
  isLoaded: boolean
}

const defaultVaultsState: VaultsStateType = {
  vaultsList: {
    myVaultsIds: [],
    allVaultsIds: [],
    vaultsMapper: {},
  },
  xtzBakers: {
    otherBakers: [],
    dao: null,
    mavrykDynamics: null,
  },
  isLoaded: false,
}

export function vaults(state = defaultVaultsState, action: Action) {
  switch (action.type) {
    case GET_VAULTS_STORAGE:
      return {
        ...state,
        vaultsList: action.vaultsList,
        xtzBakers: action.xtzBakers,
        isLoaded: true,
      }
    default:
      return state
  }
}

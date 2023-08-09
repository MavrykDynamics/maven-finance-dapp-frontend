import { VaultsSubsRecordType, VaultsCtxState } from './vaults.provider.types'

// CONSTS FOR VAULTS PROVIDER STATES
export const VAULTS_DATA = 'vaultsData'

// CONST FOR VAULTS FILTERS TYPES
export const VAULTS_ALL = 'allVaults'
export const VAULTS_USER_ALL = 'userIsOwner'
export const VAULTS_USER_DEPOSITOR = 'userIsDepositor'

// VAULTS PROVIDER DEFAULT CONSTS
export const DEFAULT_VAULTS_ACTIVE_SUBS: VaultsSubsRecordType = {
  [VAULTS_DATA]: null,
}

export const EMPTY_VAULTS_CONTEXT: DeepNonNullable<VaultsCtxState> = {
  vaultsMapper: {},
  myVaultsIds: [],
  allVaultsIds: [],
  permissionedVaultsIds: [],
}

export const DEFAULT_VAULTS_CONTEXT: DeepNullable<VaultsCtxState> = {
  vaultsMapper: null,
  myVaultsIds: null,
  allVaultsIds: null,
  permissionedVaultsIds: null,
}

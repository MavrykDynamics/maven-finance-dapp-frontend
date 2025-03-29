import {
  VaultsSubsRecordType,
  VaultsCtxState,
  NullableVaultsCtxState,
  VaultsDashboardDataType,
} from './vaults.provider.types'

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

export const EMPTY_VAULTS_DASHBOARD_DATA: VaultsDashboardDataType = {
  reducedVaultsCollaterals: [],
  totalCollateralRatio: 0,
  averageCollateralRatio: 0,
  vaultTvl: 0,
  activeVaults: 0,
}

export const EMPTY_VAULTS_CONTEXT: VaultsCtxState = {
  vaultsMapper: {},
  myVaultsIds: [],
  allVaultsIds: [],
  permissionedVaultsIds: [],
  vaultsTotalCount: 0,
  vaultsDashboardData: EMPTY_VAULTS_DASHBOARD_DATA,
}

export const DEFAULT_VAULTS_CONTEXT: NullableVaultsCtxState = {
  vaultsMapper: null,
  myVaultsIds: null,
  allVaultsIds: null,
  permissionedVaultsIds: null,
  vaultsDashboardData: null,
  vaultsTotalCount: 0,
}

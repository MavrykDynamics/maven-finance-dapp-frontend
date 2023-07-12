// CONSTS FOR VAULTS PROVIDER STATES
export const VAULTS_DATA = 'vaultsData'

// CONST FOR VAULTS FILTERS TYPES
export const VAULTS_ALL = 'allVaults'
export const VAULTS_USER_ALL = 'userIsOwner'
export const VAULTS_USER_MARKET = 'userIsOwnerAndCertainMarket'
export const VAULTS_USER_DEPOSITOR = 'userIsDepositor'

// VAULTS PROVIDER DEFAULT CONSTS
export const DEFAULT_VAULTS_ACTIVE_SUBS = {
  [VAULTS_DATA]: null,
} as const

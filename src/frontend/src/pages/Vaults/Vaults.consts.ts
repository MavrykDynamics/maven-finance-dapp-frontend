export const vaultsPathname = '/vaults'

export const COLLATERAL_NAME = 'Collateral Asset'
export const BORROWED_NAME = 'Borrowed Asset'
export const ALL_VAULTS_FILTER = 'All Assets'

export const vaultsStatuses = {
  LIQUIDATABLE: 'LIQUIDATABLE',
  GRACE_PERIOD: 'GRACE PERIOD',
  MARK: 'MARK',
  AT_RISK: 'AT RISK',
  ACTIVE: 'ACTIVE',
}

export const vaultsFilters = {
  SORT: 'sort',
  ASSETS: 'assets',
  ZERO: 'zero',
}

export const sortVaultItems = {
  MOST_RECENT: 'Most Recent',
  STATUSES: 'Status',
  COLLATERAL_HIGH: 'Collateral Amount ↑',
  COLLATERAL_LOW: 'Collateral Amount ↓',
  BORROWED_HIGH: 'Borrowed Amount ↑',
  BORROWED_LOW: 'Borrowed Amount ↓',
}

export const sortingList = Object.values(sortVaultItems)

export const statusSortPriority = {
  [vaultsStatuses.LIQUIDATABLE]: 1,
  [vaultsStatuses.GRACE_PERIOD]: 2,
  [vaultsStatuses.MARK]: 3,
  [vaultsStatuses.AT_RISK]: 4,
  [vaultsStatuses.ACTIVE]: 5,
}

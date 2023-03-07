export const vaultsPathname = '/vaults'

export const COLLATERAL_NAME = 'Collateral Asset'
export const LOAN_NAME = 'Loan Asset'

export const vaultsStatuses = {
  LIQUIDATABLE: 'LIQUIDATABLE',
  GRACE_PERIOD: 'GRACE_PERIOD',
  MARK: 'MARK',
  AT_RISK: 'AT_RISK',
  ACTIVE: 'ACTIVE',
}

export const vaultsFilters = {
  SORT: 'sort',
  ASSETS: 'assets',
  ZERO: 'zero',
}

export const sortVaultItems = {
  STATUSES: 'Status',
  COLLATERAL_VALUE: 'Collateral Amount',
  BORROWED_AMOUNT: 'Borrowed Amount',
  MOST_RECENT: 'Most Recent',
}

export const sortingList = Object.values(sortVaultItems)

export const statusSortPriority = {
  [vaultsStatuses.LIQUIDATABLE]: 1,
  [vaultsStatuses.GRACE_PERIOD]: 2,
  [vaultsStatuses.MARK]: 3,
  [vaultsStatuses.AT_RISK]: 4,
  [vaultsStatuses.ACTIVE]: 5,
}

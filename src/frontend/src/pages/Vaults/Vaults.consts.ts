export const vaultsStatuses = {
  LIQUIDATABLE: 'LIQUIDATABLE',
  GRACE_PERIOD: 'GRACE_PERIOD',
  MARK: 'MARK',
  AT_RISK: 'AT_RISK',
  ACTIVE: 'ACTIVE',
}

export const sortVaultItems = {
  STATUSES: 'Statuses',
  COLLATERAL_VALUE: 'Collateral Value',
  BORROWED_AMOUNT: 'Borrowed Amount',
  MOST_RECENT: 'Most Recent',
}

export const statusSortPriority = {
  [vaultsStatuses.LIQUIDATABLE]: 1,
  [vaultsStatuses.GRACE_PERIOD]: 2,
  [vaultsStatuses.MARK]: 3,
  [vaultsStatuses.AT_RISK]: 4,
  [vaultsStatuses.ACTIVE]: 5,
}

export type mvkStatsType = {
  marketCap: number
  stakedMvk: number
  circuatingSupply: number
  maxSupply: number
  livePrice: number
  prevPrice: number
}

export const LENDING_TAB_ID = ''
export const VAULTS_TAB_ID = 'dashboard-vaults'
export const FARMS_TAB_ID = 'dashboard-farms'
export const SATELLITES_TAB_ID = 'dashboard-satellites'
export const ORACLES_TAB_ID = 'dashboard-oracles'
export const TREASURY_TAB_ID = 'dashboard-treasury'
export const STAKING_TAB_ID = 'dashboard-staking'

export type TabId =
  | typeof LENDING_TAB_ID
  | typeof VAULTS_TAB_ID
  | typeof FARMS_TAB_ID
  | typeof SATELLITES_TAB_ID
  | typeof ORACLES_TAB_ID
  | typeof TREASURY_TAB_ID
  | typeof STAKING_TAB_ID

export const isValidPersonalDashboardTabId = (x: string): x is TabId =>
  x === LENDING_TAB_ID ||
  x === VAULTS_TAB_ID ||
  x === FARMS_TAB_ID ||
  x === SATELLITES_TAB_ID ||
  x === ORACLES_TAB_ID ||
  x === STAKING_TAB_ID ||
  x === TREASURY_TAB_ID

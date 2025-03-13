/**
 *
 * @param tokenGqlSymbol symbol of token in GQL or feed name to use tokens symbol for interaction on frontend, cuz addresses can have identical metadata, that is not ok
 * @returns null if token is not used, or {name, symbol} obj for token, if it's used
 *
 * need to do this mapper cuz back-end can't send valid names and it can have token duplicates
 */
const tokenMap = new Map<string, { name: string; symbol: string; icon: string }>([
  ['usdt/usd', { name: 'Tether', symbol: 'USDT', icon: '/images/usdt.png' }],
  ['usdt', { name: 'Tether', symbol: 'USDT', icon: '/images/usdt.png' }],
  ['musdt', { name: 'mUSDT', symbol: 'mUSDT', icon: '/images/mUSDT.svg' }],

  ['mvrk/usd', { name: 'Mavryk', symbol: 'MVRK', icon: '/images/MVRK_token.svg' }],
  ['mvrk', { name: 'Mavryk', symbol: 'MVRK', icon: '/images/MVRK_token.svg' }],
  ['mmvrk', { name: 'mMVRK', symbol: 'mMVRK', icon: '/images/mMVRK_token.svg' }],

  ['btc/usd', { name: 'wBTC', symbol: 'wBTC', icon: '/images/tzBTC.png' }],
  ['wbtc', { name: 'wBTC', symbol: 'wBTC', icon: '/images/tzBTC.png' }],
  ['mwbtc', { name: 'mWBTC', symbol: 'mWBTC', icon: '/images/mTzBTC.svg' }],

  ['eurt/usd', { name: 'Eurocoin', symbol: 'EURL', icon: '/images/eurl.png' }],
  ['euroc/usd', { name: 'Eurocoin', symbol: 'EURL', icon: '/images/eurl.png' }],
  ['eurc/usd', { name: 'Eurocoin', symbol: 'EURL', icon: '/images/eurl.png' }],
  ['eurl', { name: 'Eurocoin', symbol: 'EURL', icon: '/images/eurl.png' }],
  ['meurl', { name: 'mEURL', symbol: 'mEURL', icon: '/images/mEURL.svg' }],

  ['mvn', { name: 'Maven', symbol: 'MVN', icon: '/images/MVN_token.svg' }],
  [
    'fa12',
    {
      name: 'MAVENFA12',
      symbol: 'FA12',
      icon: '/images/MVN_token.svg',
    },
  ],
  ['smvn', { name: 'Staked Maven', symbol: 'sMVN', icon: '/images/sMVN_token.svg' }],

  ['ocean/usd', { name: 'Ocean', symbol: 'OCEAN', icon: '/images/ocean_token.png' }],
  ['ocean', { name: 'Ocean', symbol: 'OCEAN', icon: '/images/ocean_token.png' }],

  ['mars1/usd', { name: 'Mars1', symbol: 'MARS1', icon: '/images/mars_token.jpeg' }],
  ['mars1', { name: 'Mars1', symbol: 'MARS1', icon: '/images/mars_token.jpeg' }],
  [
    'fa2',
    {
      name: 'MAVENFA2',
      symbol: 'FA2',
      icon: '/images/MVN_token.svg',
    },
  ],
])

export const getTokenSymbolAndName = (tokenGqlSymbol: string) => {
  return tokenMap.get(tokenGqlSymbol.toLowerCase()) || null
}

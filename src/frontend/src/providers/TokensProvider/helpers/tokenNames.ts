/**
 *
 * @param tokenGqlSymbol symbol of token in GQL or feed name to use tokens symbol for interaction on frontend, cuz addresses can have identical metadata, that is not ok
 * @returns null if token is not used, or {name, symbol} obj for token, if it's used
 *
 * need to do this mapper cuz back-end can't send valid names and it can have token duplicates
 */
export const getTokenSymbolAndName = (tokenGqlSymbol: string) => {
  switch (tokenGqlSymbol.toLowerCase()) {
    case 'usdt/usd':
    case 'usdt':
      return { name: 'Tether', symbol: 'USDT', icon: '/images/usdt.png' }
    case 'musdt':
      return { name: 'mUSDT', symbol: 'mUSDT', icon: '/images/usdt.png' }

    case 'xtz/usd':
    case 'xtz':
      return { name: 'Tezos', symbol: 'XTZ', icon: '/images/tezos.png' }
    case 'mxtz':
      return { name: 'mXTZ', symbol: 'mXTZ', icon: '/images/tezos.png' }

    case 'btc/usd':
    case 'tzbtc':
      return { name: 'tzBTC', symbol: 'tzBTC', icon: '/images/tzBTC.png' }
    case 'mtzbtc':
      return { name: 'mTzBTC', symbol: 'mTzBTC', icon: '/images/tzBTC.png' }

    case 'euroc/usd':
    case 'eurc/usd':
    case 'eurl':
      return { name: 'Eurocoin', symbol: 'EURL', icon: '/images/eurl.png' }
    case 'meurl':
      return { name: 'mEURL', symbol: 'mEURL', icon: '/images/eurl.png' }

    case 'mvk':
      return { name: 'Mavryk', symbol: 'MVK', icon: 'https://mavryk.finance/logo192.png' }
    case 'smvk':
      return { name: 'Staked Mavryk', symbol: 'sMVK', icon: 'https://mavryk.finance/logo192.png' }
  }

  return null
}

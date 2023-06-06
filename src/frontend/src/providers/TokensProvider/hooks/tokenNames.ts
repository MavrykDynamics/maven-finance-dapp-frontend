/**
 *
 * @param tokenGqlSymbol symbol of token in GQL or feed name to use tokens symbol for interaction on frontend, cuz addresses can have identical metadata, that is not ok
 * @returns null if token is not used, or {name, symbol} obj for token, if it's used
 *
 * need to do this mapper cuz back-end can't send valid names and it can have token duplicates
 */
// TODO: mb use only token symbols, and think how to handle 2 mvk coins
export const getTokenSymbolAndName = (tokenGqlSymbol: string) => {
  switch (tokenGqlSymbol.toLowerCase()) {
    case 'usdt/usd':
    case 'USDT':
      return { name: 'Tether', symbol: 'USDT' }
    case 'mUSDT':
      return { name: 'mUSDT', symbol: 'mUSDT' }

    case 'xtz/usd':
    case 'XTZ':
      return { name: 'Tezos', symbol: 'XTZ' }
    case 'mXTZ':
      return { name: 'mXTZ', symbol: 'mXTZ' }

    case 'btc/usd':
    case 'tzBTC':
      return { name: 'tzBTC', symbol: 'tzBTC' }
    case 'mTzBTC':
      return { name: 'mTzBTC', symbol: 'mTzBTC' }

    case 'euroc/usd':
    case 'EURL':
      return { name: 'Eurocoin', symbol: 'EUROL' }
    case 'mEURL':
      return { name: 'mEUROL', symbol: 'mEUROL' }

    case 'MVK':
      return { name: 'Mavryk', symbol: 'MVK' }
  }

  return null
}

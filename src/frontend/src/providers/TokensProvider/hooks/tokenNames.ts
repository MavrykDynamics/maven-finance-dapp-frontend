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
      return { name: 'Tether', symbol: 'USDT' }
    case 'xtz/usd':
      return { name: 'Tezos', symbol: 'XTZ' }
    case 'btc/usd':
      return { name: 'tzBTC', symbol: 'tzBTC' }
    case 'euroc/usd':
      return { name: 'Eurocoin', symbol: 'EUROC' }
  }

  return null
}

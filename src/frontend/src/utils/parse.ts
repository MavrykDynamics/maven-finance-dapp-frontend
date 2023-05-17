import { isTezosAsset } from 'pages/Loans/Loans.helpers'

export const getStringWithoutUnderline = (str: string): string => (str?.length ? str.replaceAll('_', ' ') : '')

export const getSeparateCamelCase = (stringCamelCase: string): string =>
  stringCamelCase?.length ? stringCamelCase.replace(/([a-z0-9])([A-Z])/g, '$1 $2') : ''

export const getSeparateSnakeCase = (stringSnakeCase: string): string =>
  stringSnakeCase?.length ? stringSnakeCase.replaceAll('_', ' ').toLowerCase() : ''

/**
 * Feed name comes like symbol/currency, we need to get symbol and in some cases transform it to different symbol
 */
export const getSymbolAndNameFromFeedName = (feedName: string) => {
  const [symbol] = feedName.split('/')

  if (symbol.toLowerCase() === 'btc') return { symbol: 'tzbtc', name: 'tzBTC' }
  if (isTezosAsset(symbol)) return { symbol: 'tezos', name: 'XTZ' }
  if (symbol.toLowerCase() === 'euroc') return { symbol: 'eurl', name: 'EURL' }
  return { symbol: symbol.toLowerCase(), name: symbol }
}

export const getSymbolAndNameFromCollaterealGqlname = (collateralSymbol: string, gqlName: string) => {
  if (isTezosAsset(gqlName)) return { symbol: 'tezos', name: 'XTZ' }

  if (gqlName === 'tzbtc') return { symbol: 'tzbtc', name: 'tzBTC' }
  if (gqlName === 'eurl') return { symbol: 'eurl', name: 'EURL' }
  if (gqlName === 'usdt') return { symbol: 'usdt', name: 'USDT' }

  return { symbol: gqlName, name: collateralSymbol }
}

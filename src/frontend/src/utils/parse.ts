export const getSeparateCamelCase = (stringCamelCase: string): string =>
  stringCamelCase?.length ? stringCamelCase.replace(/([a-z0-9])([A-Z])/g, '$1 $2') : ''

export const getSeparateSnakeCase = (stringSnakeCase: string): string =>
  stringSnakeCase?.length ? stringSnakeCase.replaceAll('_', ' ').toLowerCase() : ''

/**
 * Feed name comes like symbol/currency, we need to get symbol and in some cases transform it to different symbol
 */
export const getSymbolFromFeedName = (feedName: string) => {
  const [symbol, currency] = feedName.split('/')

  if (symbol.toLowerCase() === 'btc') return 'tzbtc'
  if (symbol.toLowerCase() === 'xtz') return 'tezos'
  if (symbol.toLowerCase() === 'euroc') return 'eurl'
  return symbol.toLowerCase()
}

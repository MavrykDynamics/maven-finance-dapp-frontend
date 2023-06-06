import { convertNumberForClient } from 'utils/calcFunctions'
import { SubsribeOracleDataFeedSubscription } from 'utils/__generated__/graphql'
import { getTokenSymbolAndName } from './tokenNames'

export const normalizeTokenPrices = (feedsLedger: SubsribeOracleDataFeedSubscription['aggregator']) => {
  return feedsLedger.reduce<Record<string, number>>((acc, feed) => {
    const { symbol } = getTokenSymbolAndName(feed.name) ?? {}

    if (symbol) {
      acc[symbol] = convertNumberForClient({ number: feed.last_completed_data, grade: feed.decimals })
    }
    return acc
  }, {})
}

export const normalizeTokensMetadata = () => {}

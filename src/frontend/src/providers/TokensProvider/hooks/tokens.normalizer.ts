import { convertNumberForClient } from 'utils/calcFunctions'
import { SubscribeOracleStorageAggregatorSubscription } from 'utils/__generated__/graphql'
import { getTokenSymbolAndName } from './tokenNames'

export const normalizeTokenPrices = (feedsLedger: SubscribeOracleStorageAggregatorSubscription['aggregator']) => {
  return feedsLedger.reduce<Record<string, number>>((acc, feed) => {
    const { symbol } = getTokenSymbolAndName(feed.name) ?? {}

    if (symbol) {
      acc[symbol] = convertNumberForClient({ number: feed.last_completed_data, grade: feed.decimals })
    }
    return acc
  }, {})
}

import { UTCTimestamp } from 'lightweight-charts'
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'
import { Feed } from '../dataFeeds.provider.types'
import { SubsribeOracleDataFeedSubscription } from 'utils/__generated__/graphql'

import { convertNumberForClient, percentageDifference } from 'utils/calcFunctions'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'

// TODO: use contracts inside feeds after it's in dev

// Can't type it cuz metadata has unknown type for now
type FeedContractType = { metadata?: { category?: string; icon: string }; network?: string } | undefined

export const normalizeFeed = (feedGql: SubsribeOracleDataFeedSubscription['aggregator'][number]) => {
  const dataFeedsHistory = normalizeDataFeedsHistory(feedGql.history_data)
  const dataFeedsVolatility = normalizeDataFeedsVolatility(feedGql.history_data)

  const feedMetadata = feedGql.metadata as FeedContractType

  const category = feedMetadata?.metadata?.category ?? null
  const network = feed?.network ?? null

  const { history_data, ...restOfTheItem } = feedGql

  return {
    ...restOfTheItem,
    category,
    network,
    amount: convertNumberForClient({ number: feedGql.last_completed_data, grade: feedGql.decimals }),
    oraclesResponces: feedGql.last_completed_data_pct_oracle_resp / 100,
    dataFeedsHistory: dataFeedsHistory,
    dataFeedsVolatility: dataFeedsVolatility,
    icon: feedMetadata?.metadata?.icon ?? null,
  }
}

export function normalizeFeeds(feeds: SubsribeOracleDataFeedSubscription['aggregator']) {
  const dataFeedUniqueCategories = new Set<string>()

  const { feedsMapper, feedsAddresses } = feeds.reduce<{
    feedsMapper: Record<string, Feed>
    feedsAddresses: Array<string>
  }>(
    (acc, item) => {
      const feed = normalizeFeed(item)

      if (feed.category) {
        dataFeedUniqueCategories.add(feed.category)
      }

      acc.feedsMapper[feed.address] = feed
      acc.feedsAddresses.push(feed.address)

      return acc
    },
    { feedsMapper: {}, feedsAddresses: [] },
  )

  return {
    feedsMapper,
    feedsAddresses,
    feedsCategories: [...dataFeedUniqueCategories],
  }
}

export function normalizeDataFeedsHistory(
  historyData: SubsribeOracleDataFeedSubscription['aggregator'][number]['history_data'],
) {
  return historyData?.length
    ? historyData
        .map((item) => {
          return {
            time: new Date(item.timestamp).getTime() as UTCTimestamp,
            value: symbolsAfterDecimalPoint(
              convertNumberForClient({ number: item.data, grade: item.aggregator.decimals }),
            ),
          }
        })
        .reverse()
    : []
}

export function normalizeDataFeedsVolatility(
  historyData: SubsribeOracleDataFeedSubscription['aggregator'][number]['history_data'],
) {
  return historyData?.length >= 2
    ? historyData
        .reduce<Array<AreaChartPlotType>>((acc, { data, aggregator: { decimals }, timestamp }, idx, arr) => {
          if (!arr?.[idx - 1]) return acc
          acc.push({
            time: new Date(timestamp).getTime() as UTCTimestamp,
            value: percentageDifference(
              symbolsAfterDecimalPoint(convertNumberForClient({ number: data, grade: decimals })),
              symbolsAfterDecimalPoint(convertNumberForClient({ number: arr[idx - 1]?.data ?? 0, grade: decimals })),
            ),
          })
          return acc
        }, [])
        .reverse()
    : []
}

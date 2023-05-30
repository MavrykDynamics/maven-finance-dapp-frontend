import { UTCTimestamp } from 'lightweight-charts'
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'
import { Feed } from '../dataFeeds.provider.types'
import { SubsribeOracleDataFeedSubscription } from 'utils/__generated__/graphql'

import { convertNumberForClient, percentageDifference } from 'utils/calcFunctions'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'

export const normalizeFeed = (feedGql: SubsribeOracleDataFeedSubscription['aggregator'][number]) => {
  const dataFeedsHistory = normalizeDataFeedsHistory(feedGql.history_data)
  const dataFeedsVolatility = normalizeDataFeedsVolatility(feedGql.history_data)

  const category = feedGql?.metadata?.category ?? null
  const icon = feedGql?.metadata?.icon ?? null
  const network = feedGql?.network ?? null

  const { history_data, ...restOfTheItem } = feedGql

  return {
    ...restOfTheItem,
    category,
    network,
    amount: convertNumberForClient({ number: feedGql.last_completed_data, grade: feedGql.decimals }),
    oraclesResponces: feedGql.last_completed_data_pct_oracle_resp / 100,
    dataFeedsHistory: dataFeedsHistory,
    dataFeedsVolatility: dataFeedsVolatility,
    icon,
  }
}

export function normalizeFeeds(
  feeds: SubsribeOracleDataFeedSubscription['aggregator'],
  promotionAddresses?: Array<string>,
) {
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
    feedsAddresses: promotionAddresses
      ? [...feedsAddresses].sort((aAddress, bAddress) => {
          if (promotionAddresses.includes(aAddress)) return -1
          if (promotionAddresses.includes(bAddress)) return 1
          return 0
        })
      : feedsAddresses,
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

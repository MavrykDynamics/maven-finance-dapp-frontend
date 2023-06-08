import { UTCTimestamp } from 'lightweight-charts'
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'

import { percentageDifference } from 'utils/calcFunctions'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'
import { Feed, FeedHistoryData, FeedGqlType } from 'utils/TypesAndInterfaces/DataFeeds'
import { defaultAggregatorNameMaxLength } from 'app/App.components/Input/Input.constants'
import { AggregatorFactoryGraphQL } from 'utils/TypesAndInterfaces/Aggregator'

export const normalizeFeed = (feedGql: FeedGqlType) => {
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
    amount: feedGql.last_completed_data / 10 ** feedGql.decimals,
    oraclesResponces: feedGql.last_completed_data_pct_oracle_resp / 100,
    dataFeedsHistory: dataFeedsHistory,
    dataFeedsVolatility: dataFeedsVolatility,
    icon,
  }
}

export function normalizeFeeds(feeds: Array<FeedGqlType>, aggregator_factory: AggregatorFactoryGraphQL[]) {
  const dataFeedUniqueCategories = new Set<string>()

  const feedsLedger = feeds.map((item) => {
    const feed = normalizeFeed(item)

    if (feed.category) {
      dataFeedUniqueCategories.add(feed.category)
    }

    return feed
  })

  return {
    feedsLedger,
    feedsCategories: [...dataFeedUniqueCategories],
    config: {
      feedNameMaxLength: aggregator_factory[0]?.aggregator_name_max_length || defaultAggregatorNameMaxLength,
    },
  }
}

export function normalizeDataFeedsHistory(historyData: FeedHistoryData) {
  return historyData?.length
    ? historyData
        .map((item) => {
          return {
            time: new Date(item.timestamp).getTime() as UTCTimestamp,
            value: symbolsAfterDecimalPoint(item.data / 10 ** item.aggregator.decimals),
          }
        })
        .reverse()
    : []
}

export function normalizeDataFeedsVolatility(historyData: FeedHistoryData) {
  return historyData?.length >= 2
    ? historyData
        .reduce<Array<AreaChartPlotType>>((acc, { data, aggregator: { decimals }, timestamp }, idx, arr) => {
          if (!arr?.[idx - 1]) return acc
          acc.push({
            time: new Date(timestamp).getTime() as UTCTimestamp,
            value: percentageDifference(
              symbolsAfterDecimalPoint(data / 10 ** decimals),
              symbolsAfterDecimalPoint(arr[idx - 1]?.data / 10 ** decimals),
            ),
          })
          return acc
        }, [])
        .reverse()
    : []
}

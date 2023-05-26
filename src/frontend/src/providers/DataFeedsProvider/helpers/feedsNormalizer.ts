import { UTCTimestamp } from 'lightweight-charts'
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'
import { DAPPConfigContext } from 'providers/DAPPConfig/dappConfig.types'
import { Feed } from '../dataFeeds.provider.types'
import { SubsribeOracleDataFeedSubscription } from 'utils/__generated__/graphql'

import { percentageDifference } from 'utils/calcFunctions'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'

// Can't type it cuz metadata has unknown type for now
type FeedContractType = { metadata?: { category?: string; icon: string }; network?: string } | undefined

export const normalizeFeed = (
  feedGql: SubsribeOracleDataFeedSubscription['aggregator'][number],
  dipDupContracts: NonNullable<DAPPConfigContext['dipDupContracts']>,
) => {
  const dataFeedsHistory = normalizeDataFeedsHistory(feedGql.history_data)
  const dataFeedsVolatility = normalizeDataFeedsVolatility(feedGql.history_data)

  const feedMetadata = (dipDupContracts[feedGql.address] ?? {}) as FeedContractType

  const category = feedMetadata?.metadata?.category ?? null
  const network = feedMetadata?.network ?? null

  const { history_data, ...restOfTheItem } = feedGql

  return {
    ...restOfTheItem,
    category,
    network,
    amount: feedGql.last_completed_data / 10 ** feedGql.decimals,
    oraclesResponces: feedGql.last_completed_data_pct_oracle_resp / 100,
    dataFeedsHistory: dataFeedsHistory,
    dataFeedsVolatility: dataFeedsVolatility,
    icon: feedMetadata?.metadata?.icon ?? null,
  }
}

export function normalizeFeeds(
  feeds: SubsribeOracleDataFeedSubscription['aggregator'],
  dipDupContracts: NonNullable<DAPPConfigContext['dipDupContracts']>,
) {
  const dataFeedUniqueCategories = new Set<string>()

  const { feedsMapper, feedsAddresses } = feeds.reduce<{
    feedsMapper: Record<string, Feed>
    feedsAddresses: Array<string>
  }>(
    (acc, item) => {
      const feed = normalizeFeed(item, dipDupContracts)

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
            value: symbolsAfterDecimalPoint(item.data / 10 ** item.aggregator.decimals),
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
              symbolsAfterDecimalPoint(data / 10 ** decimals),
              symbolsAfterDecimalPoint(arr[idx - 1]?.data / 10 ** decimals),
            ),
          })
          return acc
        }, [])
        .reverse()
    : []
}

import { UTCTimestamp } from 'lightweight-charts'
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'
import { DataFeedsContext, Feed } from '../dataFeeds.provider.types'
import { SubsribeFeedHistoryDataSubscription } from 'utils/__generated__/graphql'

import { convertNumberForClient, percentageDifference } from 'utils/calcFunctions'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'
import { FullFeedsQueryType, SmallFeedsQueryType, feedMetadataSchema } from './feeds.schemes'

export const normalizeFeed = (feedGql: FullFeedsQueryType[number]) => {
  try {
    const feedMetadata = feedMetadataSchema.parse(feedGql.metadata)

    const { category, icon } = feedMetadata
    const network = feedGql.network

    const { oracles_aggregate, metadata, ...restOfTheItem } = feedGql

    return {
      ...restOfTheItem,
      oraclesAmount: oracles_aggregate?.aggregate?.count ?? 0,
      category: category.charAt(0).toUpperCase() + category.slice(1),
      network,
      amount: convertNumberForClient({ number: feedGql.last_completed_data, grade: feedGql.decimals }),
      oraclesResponces: feedGql.last_completed_data_pct_oracle_resp / 100,
      icon,
    }
  } catch (e) {
    console.error('paring feed metadata error: ', { e })
    return null
  }
}

// Normalizer for full feeds query, that loads only on init, and when feed added/removed
export function normalizeFeeds(feeds: FullFeedsQueryType, promotionAddresses?: Array<string>) {
  const dataFeedUniqueCategories = new Set<string>()

  const { feedsMapper, feedsAddresses } = feeds.reduce<{
    feedsMapper: Record<string, Feed>
    feedsAddresses: Array<string>
  }>(
    (acc, item) => {
      const feed = normalizeFeed(item)
      if (!feed) return acc

      dataFeedUniqueCategories.add(feed.category.charAt(0).toUpperCase() + feed.category.slice(1))

      acc.feedsMapper[feed.address] = feed
      acc.feedsAddresses.push(feed.address)

      return acc
    },
    { feedsMapper: {}, feedsAddresses: [] },
  )

  const sortedFeedsAddressesByPromotedFirst = promotionAddresses
    ? [...feedsAddresses].sort((aAddress, bAddress) => {
        if (promotionAddresses.includes(aAddress)) return -1
        if (promotionAddresses.includes(bAddress)) return 1
        return 0
      })
    : feedsAddresses

  return {
    feedsMapper,
    feedsAddresses: sortedFeedsAddressesByPromotedFirst,
    feedsCategories: Array.from(dataFeedUniqueCategories),
  }
}

// Normalizer for small feeds query, that updates
export function normalizeFeedsPrices(feedsFromCtx: DataFeedsContext['feedsMapper'], smallFeeds: SmallFeedsQueryType) {
  return smallFeeds.reduce<DataFeedsContext['feedsMapper']>((acc, smallFeedGql) => {
    const {
      last_completed_data_pct_oracle_resp,
      address,
      last_completed_data,
      last_completed_data_last_updated_at,
      decimals,
    } = smallFeedGql
    const prevFeed = feedsFromCtx[address]

    if (prevFeed) {
      acc[address] = {
        ...prevFeed,
        amount: convertNumberForClient({ number: Number(last_completed_data), grade: Number(decimals) }),
        oraclesResponces: last_completed_data_pct_oracle_resp / 100,
        last_completed_data_last_updated_at,
      }
    }

    return acc
  }, {})
}

export function normalizeDataFeedsHistory(
  historyData: SubsribeFeedHistoryDataSubscription['aggregator'][number]['history_data'],
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
  historyData: SubsribeFeedHistoryDataSubscription['aggregator'][number]['history_data'],
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

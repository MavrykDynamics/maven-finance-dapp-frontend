import { UTCTimestamp } from 'lightweight-charts'
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'
import { DataFeedsContext, Feed, NullableDataFeedsContextStateType } from '../dataFeeds.provider.types'
import { FeedHistoryQeuryQuery } from 'utils/__generated__/graphql'

import { convertNumberForClient, percentageDifference } from 'utils/calcFunctions'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'
import { FullFeedsQueryType, SmallFeedsQueryType, feedMetadataSchema } from './feeds.schemas'

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
export function normalizeFeedsPrices(
  feedsFromCtx: NonNullable<NullableDataFeedsContextStateType['feedsMapper']>,
  smallFeeds: SmallFeedsQueryType,
) {
  return smallFeeds.reduce<NonNullable<NullableDataFeedsContextStateType['feedsMapper']>>((acc, smallFeedGql) => {
    const { address, last_completed_data_pct_oracle_resp, last_completed_data, last_completed_data_last_updated_at } =
      smallFeedGql
    const feedFromCtx = feedsFromCtx[address]

    if (feedFromCtx) {
      acc[address] = {
        ...feedFromCtx,
        amount: convertNumberForClient({ number: Number(last_completed_data), grade: Number(feedFromCtx.decimals) }),
        oraclesResponces: last_completed_data_pct_oracle_resp / 100,
        last_completed_data_last_updated_at,
      }
    }

    return acc
  }, {})
}

export function normalizeDataFeedsHistory(historyData: FeedHistoryQeuryQuery['aggregator'][number]['history_data']) {
  const { dataFeedsHistory, dataFeedsVolatility } = historyData.reduce<{
    dataFeedsHistory: AreaChartPlotType[]
    dataFeedsVolatility: AreaChartPlotType[]
  }>(
    (acc, { data, aggregator: { decimals }, timestamp }, idx, arr) => {
      const prevItem = arr[idx - 1]
      // for volatility we should have current item and prev to get their difference in %
      if (prevItem) {
        const { data: prevData } = prevItem
        // volatility
        acc.dataFeedsVolatility.push({
          time: new Date(timestamp).getTime() as UTCTimestamp,
          value: percentageDifference(
            symbolsAfterDecimalPoint(convertNumberForClient({ number: data, grade: decimals })),
            symbolsAfterDecimalPoint(convertNumberForClient({ number: prevData, grade: decimals })),
          ),
        } as AreaChartPlotType)
      }

      // history
      acc.dataFeedsHistory.push({
        time: new Date(timestamp).getTime() as UTCTimestamp,
        value: symbolsAfterDecimalPoint(convertNumberForClient({ number: data, grade: decimals })),
      } as AreaChartPlotType)

      return acc
    },
    { dataFeedsHistory: [], dataFeedsVolatility: [] },
  )

  return { dataFeedsHistory: dataFeedsHistory.reverse(), dataFeedsVolatility: dataFeedsVolatility.reverse() }
}

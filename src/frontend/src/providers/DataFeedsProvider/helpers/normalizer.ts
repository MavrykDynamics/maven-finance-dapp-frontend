import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'
import { UTCTimestamp } from 'lightweight-charts'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'
import { GetOracleDataFeedsQuery } from 'utils/__generated__/graphql'
import { percentageDifference } from 'utils/calcFunctions'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'

export function normalizeFeeds({ aggregator, aggregator_factory, dipdup_contract_metadata }: GetOracleDataFeedsQuery) {
  const dataFeedUniqueCategories = new Set<string>()

  const getCategoryAndNetwork = (address: string) => {
    const foundItem = dipdup_contract_metadata?.find((element) => element.contract === address) as
      | { metadata?: { category?: string }; network?: string }
      | undefined

    const category = foundItem?.metadata?.category
    const network = foundItem?.network || null

    if (!category) {
      return {
        category: null,
        network,
      }
    }

    dataFeedUniqueCategories.add(category)

    return {
      category,
      network,
    }
  }

  // TODO fix return type for feeds ledger
  const feedsLedger = aggregator.map((item) => {
    const dataFeedsHistory = normalizeDataFeedsHistory(item.history_data)
    const dataFeedsVolatility = normalizeDataFeedsVolatility(item.history_data)

    const { icon } =
      (dipdup_contract_metadata?.find(({ contract }) => contract === item.address)?.metadata as {
        icon?: string
      }) ?? {}

    const { history_data, ...restOfTheItem } = item

    const feed = {
      ...restOfTheItem,
      ...getCategoryAndNetwork(item.address),
      amount: item.last_completed_data / 10 ** item.decimals,
      oraclesResponces: item.last_completed_data_pct_oracle_resp / 100,
      dataFeedsHistory: dataFeedsHistory,
      dataFeedsVolatility: dataFeedsVolatility,
      icon,
    }
    return feed
  }) as Feed[]

  return {
    feedsLedger,
    feedCategories: [...dataFeedUniqueCategories],
  }
}

export type HistoryData = Array<{
  __typename?: 'aggregator_history_data'
  data: any
  timestamp: any
  aggregator: {
    __typename?: 'aggregator'
    decimals: any
  }
}>

export function normalizeDataFeedsHistory(historyData: HistoryData) {
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

export function normalizeDataFeedsVolatility(historyData: HistoryData) {
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

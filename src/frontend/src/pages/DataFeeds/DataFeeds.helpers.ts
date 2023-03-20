import { AreaChartPlotType } from 'app/App.components/Chart/Chart.types'
import { defaultAggregatorNameMaxLength } from 'app/App.components/Input/Input.constants'
import { UTCTimestamp } from 'lightweight-charts'
import { percentageDifference } from 'utils/calcFunctions'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'
import {
  AggregatorGraphQL,
  AggregatorFactoryGraphQL,
  DipdupContractMetadataGraphQL,
} from 'utils/TypesAndInterfaces/Aggregator'
import { DataFeedsHistoryGraphQL, Feed } from 'utils/TypesAndInterfaces/DataFeeds'

export function normalizeFeeds({
  aggregator,
  aggregator_factory,
  dipdup_contract_metadata,
}: {
  aggregator: AggregatorGraphQL[]
  aggregator_factory: AggregatorFactoryGraphQL[]
  dipdup_contract_metadata: DipdupContractMetadataGraphQL[]
}) {
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

  const feedsLedger = aggregator.map<Feed>((item) => {
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
      dataFeedsHistory: dataFeedsHistory,
      dataFeedsVolatility: dataFeedsVolatility,
      icon,
    }
    return feed
  })

  return {
    feedsLedger,
    feedCategories: [...dataFeedUniqueCategories],
    config: {
      feedNameMaxLength: aggregator_factory[0]?.aggregator_name_max_length || defaultAggregatorNameMaxLength,
      feedsFactoryAddress: aggregator_factory?.[0]?.address || '',
    },
  }
}

export function normalizeDataFeedsHistory(historyData: DataFeedsHistoryGraphQL[]) {
  return historyData?.length
    ? historyData.map((item) => {
        return {
          time: new Date(item.timestamp).getTime() as UTCTimestamp,
          value: symbolsAfterDecimalPoint(item.data / 10 ** item.aggregator.decimals),
        }
      })
    : []
}

export function normalizeDataFeedsVolatility(historyData: DataFeedsHistoryGraphQL[]) {
  return historyData?.length >= 2
    ? historyData.reduce<Array<AreaChartPlotType>>((acc, { data, aggregator: { decimals }, timestamp }, idx, arr) => {
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
    : []
}

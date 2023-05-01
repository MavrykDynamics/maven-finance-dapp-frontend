import { SubscribeSmvkHistoryDataSubscription } from 'utils/__generated__/graphql'
import { UTCTimestamp } from 'lightweight-charts'

// calc
import { calcWithoutPrecision } from 'utils/calcFunctions'

type HistoryItemType = {
  value: number
  time: UTCTimestamp
}

export function normalizeSmvkHistoryData(storage: SubscribeSmvkHistoryDataSubscription) {
  const { smvk_history_data = [] } = storage

  const history = smvk_history_data.reduce<{
    mvkHistoryData: HistoryItemType[]
    smvkHistoryData: HistoryItemType[]
  }>(
    (acc, item) => {
      acc.mvkHistoryData.push({
        value: parseFloat(calcWithoutPrecision(item.mvk_total_supply - item.smvk_total_supply).toFixed(2)),
        time: new Date(item.timestamp).getTime() as UTCTimestamp,
      })

      acc.smvkHistoryData.push({
        value: parseFloat(calcWithoutPrecision(item.smvk_total_supply).toFixed(2)),
        time: new Date(item.timestamp).getTime() as UTCTimestamp,
      })

      return acc
    },
    {
      mvkHistoryData: [],
      smvkHistoryData: [],
    },
  )

  return history
}

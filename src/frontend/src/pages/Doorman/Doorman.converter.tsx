// type
import {
  MvkTokenGraphQL,
  MvkHistoryData,
  SmvkHistoryDataGraphQl,
  MvkHistoryDataGraphQl,
} from '../../utils/TypesAndInterfaces/Doorman'

// helpers
import { calcWithoutPrecision } from '../../utils/calcFunctions'
import { UTCTimestamp } from 'lightweight-charts'
import { Mavryk_User } from 'utils/generated/graphqlTypes'

export function normalizeDoormanStorage(storage: {
  mavryk_user: Array<Mavryk_User>
  mvk_token: Array<MvkTokenGraphQL>
}) {
  const {
    mavryk_user: [mvkContractData],
    mvk_token: [mvkTokenItem],
  } = storage

  const totalStakedMvk = mvkContractData.mvk_balance
  return {
    totalStakedMvk: calcWithoutPrecision(totalStakedMvk),
    totalSupply: mvkTokenItem?.total_supply ? calcWithoutPrecision(mvkTokenItem?.total_supply) : 0,
    maximumTotalSupply: mvkTokenItem?.maximum_supply ? calcWithoutPrecision(mvkTokenItem?.maximum_supply) : 0,
  }
}

type SmvkHistoryDataProps = {
  smvk_history_data: SmvkHistoryDataGraphQl[]
}

export function normalizeSmvkHistoryData(storage: SmvkHistoryDataProps) {
  const { smvk_history_data } = storage

  return smvk_history_data?.length
    ? smvk_history_data?.map((item) => {
        return {
          value: parseFloat(calcWithoutPrecision(item.smvk_total_supply).toFixed(2)),
          time: new Date(item.timestamp).getTime() as UTCTimestamp,
        }
      })
    : []
}

type MvkHistoryDataProps = {
  mvk_token: Array<{
    transfer_history_data: MvkHistoryDataGraphQl[]
  }>
}

export function normalizeMvkHistoryData(storage: MvkHistoryDataProps) {
  const {
    mvk_token: [{ transfer_history_data }],
  } = storage

  return transfer_history_data?.length
    ? transfer_history_data?.map((item) => {
        return {
          // TODO: temp solution while it's not correct data
          value: parseFloat(calcWithoutPrecision(item.amount).toFixed(2)) * 10,
          time: new Date(item.timestamp).getTime() as UTCTimestamp,
        }
      })
    : []
}

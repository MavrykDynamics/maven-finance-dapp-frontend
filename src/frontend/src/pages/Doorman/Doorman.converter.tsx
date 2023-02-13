// type
import {
  DoormanGraphQl,
  MvkTokenGraphQL,
  MvkMintHistoryDataGraphQl,
  SmvkHistoryDataGraphQl,
} from '../../utils/TypesAndInterfaces/Doorman'

// helpers
import { calcWithoutPrecision } from '../../utils/calcFunctions'
import { symbolsAfterDecimalPoint } from '../../utils/symbolsAfterDecimalPoint'
import { UTCTimestamp } from 'lightweight-charts'

export function normalizeDoormanStorage(storage: {
  doorman: Array<DoormanGraphQl>
  mvk_token: Array<MvkTokenGraphQL>
}) {
  const {
    doorman: [dormanItem],
    mvk_token: [mvkTokenItem],
  } = storage

  const totalStakedMvk = dormanItem?.stake_accounts_aggregate?.aggregate?.sum?.smvk_balance ?? 0
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
          value: symbolsAfterDecimalPoint(calcWithoutPrecision(item.smvk_total_supply)),
          time: new Date(item.timestamp).getTime() as UTCTimestamp,
        }
      })
    : []
}

type MvkMintHistoryDataProps = {
  mvk_mint_history_data: MvkMintHistoryDataGraphQl[]
}

export function normalizeMvkMintHistoryData(storage: MvkMintHistoryDataProps) {
  const { mvk_mint_history_data } = storage

  return mvk_mint_history_data?.length
    ? mvk_mint_history_data?.map((item) => {
        return {
          value: symbolsAfterDecimalPoint(calcWithoutPrecision(item.mvk_total_supply)),
          time: new Date(item.timestamp).getTime() as UTCTimestamp,
        }
      })
    : []
}

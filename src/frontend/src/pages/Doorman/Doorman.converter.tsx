// type
import {
  MvkTokenGraphQL,
  MvkHistoryData,
  SmvkHistoryDataGraphQl,
  MvkHistoryDataGraphQl,
} from '../../utils/TypesAndInterfaces/Doorman'

// helpers
import { isValidNumberValue } from 'utils/validatorFunctions'
import { calcWithoutPrecision } from '../../utils/calcFunctions'
import { UTCTimestamp } from 'lightweight-charts'
import { Mavryk_User } from 'utils/generated/graphqlTypes'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import {AreaChartPlotType, CandlestickChartPlotType} from "../../app/App.components/Chart/helpers/Chart.types";

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

export function normalizeMvkHistoryData(storage: SmvkHistoryDataProps) {
  const { smvk_history_data } = storage
  // TODO: I did this fast and dirty, def a better way to do it inside the normalizeSmvkHistoryData function
  return smvk_history_data?.length
      ? smvk_history_data?.map((item) => {
        return {
          value: parseFloat(calcWithoutPrecision(item.mvk_total_supply - item.smvk_total_supply).toFixed(2)),
          time: new Date(item.timestamp).getTime() as UTCTimestamp,
        }
      })
      : []
}
export const stakingInputValidation = ({
  amount,
  myMvkTokenBalance,
  mySMvkTokenBalance,
  accountPkh,
}: {
  amount: number
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  accountPkh?: string
}) => {
  if (amount === 0) return ''

  return isValidNumberValue(
    amount,
    1,
    accountPkh ? Math.max(Number(myMvkTokenBalance), Number(mySMvkTokenBalance)) : undefined,
  )
    ? INPUT_STATUS_SUCCESS
    : INPUT_STATUS_ERROR
}

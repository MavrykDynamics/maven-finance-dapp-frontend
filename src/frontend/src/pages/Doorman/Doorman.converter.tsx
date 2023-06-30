// type
import { MvkTokenGraphQL, SmvkHistoryDataGraphQl } from '../../utils/TypesAndInterfaces/Doorman'

// helpers
import { isValidNumberValue } from 'utils/validatorFunctions'
import { calcWithoutPrecision } from '../../utils/calcFunctions'
import { UTCTimestamp } from 'lightweight-charts'
import { Mavryk_User } from 'utils/generated/graphqlTypes'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

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

type HistoryItemType = {
  value: number
  time: UTCTimestamp
}

type SmvkHistoryDataProps = {
  smvk_history_data: SmvkHistoryDataGraphQl[]
}

export function normalizeDoormanChartsData(storage: SmvkHistoryDataProps) {
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

export const stakingInputValidation = ({
  amount,
  myMvkTokenBalance,
  mySMvkTokenBalance,
  userAddress,
}: {
  amount: number
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  userAddress: string | null
}) => {
  if (amount === 0) return ''

  return isValidNumberValue(
    amount,
    1,
    userAddress ? Math.max(Number(myMvkTokenBalance), Number(mySMvkTokenBalance)) : undefined,
  )
    ? INPUT_STATUS_SUCCESS
    : INPUT_STATUS_ERROR
}

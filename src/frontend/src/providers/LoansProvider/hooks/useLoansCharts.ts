// provider
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useLoansContext } from './../loans.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// consts & helpers
import { GET_LOANS_HISTORY_DATA } from 'providers/LoansProvider/queries/loansHistory.query'
import { normalizeLoansCharts } from '../helpers/loansCharts.normalizer'
import { EMPTY_LOANS_CHARTS } from '../helpers/loans.const'

export type LoansChartsToCalcType = {
  calcTotalLendingChart?: boolean
  calcTotalBorrowingChart?: boolean
  calcTotalCollateralChart?: boolean
  calcMarketBorrowChart?: boolean
  calcMarketLendingChart?: boolean
}

const useLoansCharts = (chartsToCalc: LoansChartsToCalcType) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { chartsData, setLoansChartsData, marketsAddresses } = useLoansContext()

  useQueryWithRefetch(GET_LOANS_HISTORY_DATA, {
    onCompleted: (data) => {
      const newChartsData = normalizeLoansCharts({ indexerData: data, chartsToCalc, tokensPrices, tokensMetadata })
      setLoansChartsData(newChartsData)
    },
    onError: (error) => {
      console.error('GET_LOANS_HISTORY_DATA error: ', { error })
    },
  })

  const {
    calcTotalLendingChart,
    calcTotalBorrowingChart,
    calcTotalCollateralChart,
    calcMarketBorrowChart,
    calcMarketLendingChart,
  } = chartsToCalc

  const { totalLendingChart, totalBorrowingChart, totalCollateralChart, marketBorrowChart, marketLendingChart } =
    chartsData ?? {}

  const isLoading = Boolean(
    (calcTotalLendingChart && !totalLendingChart) ||
      (calcTotalBorrowingChart && !totalBorrowingChart) ||
      (calcTotalCollateralChart && !totalCollateralChart) ||
      (calcMarketBorrowChart &&
        (!marketBorrowChart || marketsAddresses.some((marketAddress) => !marketBorrowChart[marketAddress]))) ||
      (calcMarketLendingChart &&
        (!marketLendingChart || marketsAddresses.some((marketAddress) => !marketLendingChart[marketAddress]))),
  )

  return { isLoading, chartsData: chartsData ?? EMPTY_LOANS_CHARTS }
}

export default useLoansCharts

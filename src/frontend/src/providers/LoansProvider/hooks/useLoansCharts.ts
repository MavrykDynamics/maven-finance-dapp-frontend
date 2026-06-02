// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useLoansContext } from './../loans.provider'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'

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
  const { handleQueryError } = useQueryProvider()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { chartsData, setLoansChartsData, marketsAddresses } = useLoansContext()

  useGraphQLQuery(GET_LOANS_HISTORY_DATA, {
    skip: !marketsAddresses.length,
    variables: {},
    onCompleted: (data) => {
      const newChartsData = normalizeLoansCharts({
        indexerData: data,
        chartsToCalc,
        tokensPrices,
        tokensMetadata,
        marketsAddresses: marketsAddresses,
      })
      setLoansChartsData(newChartsData)
    },
    onError: (error) => handleQueryError(error, 'GET_LOANS_HISTORY_DATA'),
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

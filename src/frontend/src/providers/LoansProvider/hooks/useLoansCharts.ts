import { useState } from 'react'
import { useSubscription } from '@apollo/client'

// provider
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// types
import { LoansChartsType, UseLoansChartsStateType } from '../helpers/loans.types'

// consts & helpers
import { GET_LOANS_HISTORY_DATA } from 'providers/LoansProvider/queries/loansHistory.query'
import { normalizeLoansCharts } from '../helpers/loansCharts.normalizer'

const useLoansCharts = (chartsToCalc: LoansChartsType) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const [chartsData, setChartsData] = useState<UseLoansChartsStateType>({
    totalLendingChart: [],
    totalBorrowingChart: [],
    totalCollateralChart: [],
    marketCollateralChart: {},
    marketLendingChart: {},
  })

  const { loading } = useSubscription(GET_LOANS_HISTORY_DATA, {
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      const newChartsData = normalizeLoansCharts({ indexerData: data, chartsToCalc, tokensPrices, tokensMetadata })
      setChartsData(newChartsData)
    },
    onError: (error) => {
      console.error('GET_LOANS_HISTORY_DATA error: ', { error })
    },
  })

  return { isLoading: loading, chartsData }
}

export default useLoansCharts

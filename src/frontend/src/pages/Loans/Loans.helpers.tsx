import { UTCTimestamp } from 'lightweight-charts'
import { LoansChartsDataType } from 'reducers/loans'
import { LoansGQL } from 'utils/TypesAndInterfaces/Loans'

export const normalizeLoans = (storage?: LoansGQL) => {
  const chartsData = storage?.history_data?.reduce<LoansChartsDataType>(
    (acc, { type, amount, timestamp }) => {
      switch (type) {
        case 0:
        case 1:
          acc.totalLended += amount
          acc.lendingChartData.push({ time: new Date(timestamp).getTime() as UTCTimestamp, value: amount })
          break

        case 2:
        case 3:
          acc.totalBorrowed += amount
          acc.borrowingChartData.push({ time: new Date(timestamp).getTime() as UTCTimestamp, value: amount })
          break
      }
      return acc
    },
    {
      totalBorrowed: 0,
      borrowingChartData: [],
      totalLended: 0,
      lendingChartData: [],
    },
  )

  console.log('chartsData', chartsData)

  return {
    loanAssets: ['XTZ', 'EURL', 'USDT'],
    chartsData,
  }
}

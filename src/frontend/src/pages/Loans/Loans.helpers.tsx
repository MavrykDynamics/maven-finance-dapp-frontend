import { UTCTimestamp } from 'lightweight-charts'
import { State } from 'reducers'
import { LoansChartsDataType, LoansGQL, LoanTokenType } from 'utils/TypesAndInterfaces/Loans'

export const normalizeLoans = ({
  storage,
  dipDupTokens,
}: {
  storage: LoansGQL
  dipDupTokens: State['tokens']['dipDupTokens']
}) => {
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

  const loanTokens = storage?.loan_tokens?.reduce<Array<LoanTokenType>>(
    (acc, { lp_token_address, utilisation_rate, total_borrowed, total_remaining }) => {
      const tokenInfo = dipDupTokens?.find(({ contract }) => contract === lp_token_address)

      if (tokenInfo) {
        const loanToken = {
          loanTokenData: {
            name: tokenInfo.metadata.name,
            symbol: tokenInfo.metadata.symbol,
            decimals: tokenInfo.metadata.decimals,
            icon: tokenInfo.metadata.icon,
          },
          utilisationRate: utilisation_rate,
          totalBorrowed: total_borrowed,
          totalLended: total_remaining,
        }

        acc.push(loanToken)
      }
      return acc
    },
    [],
  )

  return {
    loanTokens,
    chartsData,
  }
}

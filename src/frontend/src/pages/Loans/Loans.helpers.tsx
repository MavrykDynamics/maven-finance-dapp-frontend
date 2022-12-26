import { UTCTimestamp } from 'lightweight-charts'
import { State } from 'reducers'
import { parseDate } from 'utils/time'
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
    (acc, { lp_token_address, utilisation_rate, total_borrowed, total_remaining, history_data }) => {
      const tokenInfo = dipDupTokens?.find(({ contract }) => contract === lp_token_address)

      if (tokenInfo) {
        const loanToken = {
          loanTokenData: {
            name: tokenInfo.metadata.name,
            symbol: tokenInfo.metadata.symbol,
            decimals: tokenInfo.metadata.decimals,
            icon: tokenInfo.metadata.icon,
          },
          transactionHistory: history_data
            .map(({ type, amount, timestamp, sender_id, operation_hash }) => {
              return {
                amount,
                date: parseDate({ time: new Date(timestamp).getTime(), timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC' }),
                userAddress: sender_id,
                operationHash: operation_hash,
                descr: getDescrByType(type),
              }
            })
            .filter(({ descr }) => Boolean(descr)),
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

/** ADD_LIQUIDITY: 0
 * REMOVE_LIQUIDITY: 1
 * BORROW: 2
 * REPAY: 3
 * DEPOSIT: 4
 * WITHDRAW: 5
 * DEPOSIT_SMVK: 6
 * WITHDRAW_SMVK: 7
 * VAULT_CREATION: 8
 * MARK_FOR_LIQUIDATION: 9
 * LIQUIDATE_VAULT: 10
 * CLOSE_VAULT: 11
 * */

const getDescrByType = (type: number) => {
  switch (type) {
    case 0:
      return 'Liquidity Added'
    case 1:
      return 'Liquidity Removed'
    case 2:
      return 'Borrowed'
    case 3:
      return 'Repaid'
    case 4:
      return 'Deposited'
    case 5:
      return 'WITHDRAW DEF'
    case 6:
      return 'DEPOSIT_SMVK DEF'
    case 7:
      return 'WITHDRAW_SMVK DEF'
    case 8:
      return 'Vault Created'
    case 9:
      return 'Vault Marked for Liq.'
    case 10:
      return 'Vault Liquidated'
    case 11:
      return 'Vault Closed'
    default:
      return null
  }
}

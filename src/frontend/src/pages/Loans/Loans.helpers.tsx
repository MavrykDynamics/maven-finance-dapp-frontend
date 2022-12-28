import { UTCTimestamp } from 'lightweight-charts'
import { State } from 'reducers'
import { UserState } from 'reducers/wallet'
import {
  Lending_Controller_Collateral_Token,
  Lending_Controller_History_Data,
  Lending_Controller_Loan_Token,
  Lending_Controller_Vault,
} from 'utils/generated/graphqlTypes'
import { parseDate } from 'utils/time'
import { LendingItemType, LoansChartsDataType, LoansGQL, LoanTokenType } from 'utils/TypesAndInterfaces/Loans'

const corrateralCalc = (vaults: Lending_Controller_Vault[]) =>
  vaults.reduce(
    (acc, { collateral_balances, history_data }) => {
      const vaultCorratealBalance = collateral_balances.reduce((vaultAcc, { balance }) => {
        // TODO: add multipliying by rate of the asset
        vaultAcc += balance
        return vaultAcc
      }, 0)

      const borrowedAmount = history_data.reduce((vaultAcc, { type, amount }) => {
        // TODO: add multipliying by rate of the asset
        if (type === 3 || type === 2) {
          vaultAcc += amount
        }
        return vaultAcc
      }, 0)

      acc.corratealAmount += vaultCorratealBalance
      acc.borrowedAmount += borrowedAmount
      return acc
    },
    { corratealAmount: 0, borrowedAmount: 0 },
  )

const getTransactionHistory = (
  history_data: Lending_Controller_History_Data[],
  dipDupTokens: State['tokens']['dipDupTokens'],
) =>
  history_data.reduce<{
    transactionHistory: LoanTokenType['transactionHistory']
    totalBorrowed: number
    totalLended: number
  }>(
    (acc, { type, amount, timestamp, sender_id, operation_hash, loan_token }) => {
      const tokenSymbol = dipDupTokens?.find(({ contract }) => contract === loan_token?.loan_token_address)?.metadata
        .symbol

      const descrByType = getDescrByType(type)
      if (descrByType) {
        acc.transactionHistory.push({
          amount,
          date: parseDate({ time: new Date(timestamp).getTime(), timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC' }),
          userAddress: sender_id,
          operationHash: operation_hash,
          descr: getDescrByType(type),
          tokenSymbol,
        })
      }

      if (type === 1 || type === 0) {
        acc.totalLended += amount
      }

      if (type === 3 || type === 2) {
        acc.totalBorrowed += amount
      }

      return acc
    },
    { transactionHistory: [], totalBorrowed: 0, totalLended: 0 },
  )

const getChartData = (history_data: Lending_Controller_History_Data[]) =>
  history_data?.reduce<LoansChartsDataType>(
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

const getLendingItem = (
  loanToken: Lending_Controller_Loan_Token,
  userMTokens: UserState['mTokens'],
  loanTokenMetadata: Record<string, string>,
): LendingItemType => {
  if (userMTokens && loanToken) {
    const mTokenAsset = userMTokens?.find(({ m_token_id }) => m_token_id === loanToken.lp_token_address)
    if (mTokenAsset) {
      return {
        assetName: loanTokenMetadata.symbol,
        assetIcon: loanTokenMetadata.icon,
        lendValue: mTokenAsset.balance,
        lendAssetRate: 1,
        lendAPY: 1,
        interestEarned: 1,
        loanAssetWalletBalance: mTokenAsset.balance,
        mXTZBalance: 0,
      }
    }
  }
  return null
}

const getBorrowings = (loanTokenVaults: Array<Lending_Controller_Vault>) => {
  return []
}

const getCollateralTokens = (collateralTokens: Array<Lending_Controller_Collateral_Token>) => {
  return []
}

export const normalizeLoans = ({
  storage,
  dipDupTokens,
  mTokens,
  userMTokens,
}: {
  storage: LoansGQL
  dipDupTokens: State['tokens']['dipDupTokens']
  mTokens: State['tokens']['mTokens']
  userMTokens: UserState['mTokens']
}) => {
  const loanTokens = storage?.loan_tokens?.reduce<Array<LoanTokenType>>((acc, loanToken) => {
    const {
      lp_token_address,
      loan_token_name,
      utilisation_rate,
      total_remaining,
      history_data,
      vaults,
      reserve_ratio,
    } = loanToken
    const tokenInfo = dipDupTokens?.find(({ contract }) => contract === lp_token_address)
    const { transactionHistory, totalBorrowed, totalLended } = getTransactionHistory(history_data, dipDupTokens)
    const { corratealAmount, borrowedAmount } = corrateralCalc(vaults)

    if (tokenInfo) {
      const loanTokenMetadata = {
        name: loan_token_name,
        symbol: tokenInfo.metadata.symbol,
        decimals: tokenInfo.metadata.decimals,
        icon: tokenInfo.metadata.icon,
      }
      acc.push({
        loanTokenData: loanTokenMetadata,
        borrowingList: getBorrowings(vaults),
        lendingItem: getLendingItem(loanToken, userMTokens, loanTokenMetadata),
        transactionHistory,
        utilisationRate: utilisation_rate,
        totalBorrowed,
        borrowers: vaults.length,
        suppliers: mTokens.filter(({ loan_token_name: m_token_name }) => loan_token_name === m_token_name).length,
        collateral: corratealAmount,
        vaultsBorrowedAmount: borrowedAmount,
        totalLended,
        reserveRatio: reserve_ratio,
        avaliableLiquidity: total_remaining,
      })
    }
    return acc
  }, [])

  return {
    loanTokens,
    chartsData: getChartData(storage?.history_data),
    collateralTokens: getCollateralTokens(storage.collateral_tokens),
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

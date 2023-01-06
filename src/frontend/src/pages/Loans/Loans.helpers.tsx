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
import {
  BorrowingData,
  LendingItemType,
  LoansChartsDataType,
  LoansGQL,
  LoanTokenType,
} from 'utils/TypesAndInterfaces/Loans'

const getCollateralTotal = (
  vaults: Lending_Controller_Vault[],
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokensRates: Record<string, number>,
) =>
  vaults.reduce(
    //TOOD: what should i do if i don't have rate for token
    (acc, { collateral_balances = [], history_data = [] }) => {
      const vaultCorratealBalance = collateral_balances.reduce((vaultAcc, { balance, token }) => {
        const assetSymbol = dipDupTokens.find(({ contract }) => contract === token?.token_address)?.metadata.symbol
        const rate = assetSymbol ? tokensRates[assetSymbol] ?? 1 : 1
        vaultAcc += balance * rate
        return vaultAcc
      }, 0)

      const borrowedAmount = history_data.reduce((vaultAcc, { type, amount, loan_token }) => {
        if (type === 3 || type === 2) {
          const assetSymbol = dipDupTokens.find(({ contract }) => contract === loan_token?.loan_token_address)?.metadata
            .symbol
          const rate = assetSymbol ? tokensRates[assetSymbol] ?? 1 : 1
          vaultAcc += amount * rate
        }
        return vaultAcc
      }, 0)

      acc.corratealAmount += Number(vaultCorratealBalance)
      acc.borrowedAmount += Number(borrowedAmount)
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
  loanTokenMetadata: LoanTokenType['loanTokenData'],
  tokensRates: Record<string, number>,
): LendingItemType => {
  if (userMTokens && loanToken) {
    const mTokenAsset = userMTokens?.find(({ m_token_id }) => m_token_id === loanToken.lp_token_address)
    if (mTokenAsset) {
      return {
        assetName: loanTokenMetadata.symbol ?? loanTokenMetadata.name,
        assetIcon: loanTokenMetadata.icon,
        lendValue: mTokenAsset.balance,
        lendAssetRate: tokensRates[loanTokenMetadata.symbol ?? loanTokenMetadata.name] ?? null,
        lendAPY: 1,
        interestEarned: 1,
        loanAssetWalletBalance: mTokenAsset.balance,
        mXTZBalance: 0,
      }
    }
  }
  return null
}

const getBorrowings = (
  loanTokenVaults: Array<Lending_Controller_Vault>,
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokensRates: Record<string, number>,
  userAddress?: string,
): { myBorrowingList: Array<BorrowingData>; permissinedBorrowingList: Array<BorrowingData> } => {
  return loanTokenVaults.reduce<{
    myBorrowingList: Array<BorrowingData>
    permissinedBorrowingList: Array<BorrowingData>
  }>(
    (acc, vault) => {
      const asset = dipDupTokens.find(({ contract }) => contract === vault.loan_token?.loan_token_address)

      const normallizedVault = {
        borrowedAsset: {
          assetSymbol: asset?.metadata.symbol,
          assetIcon: asset?.metadata.icon,
          amtBorrowed: 0,
          ...(asset?.metadata.symbol ? { assetRate: tokensRates[asset.metadata.symbol] } : { assetRate: null }),
          collateralBalance: vault?.collateral_balances_aggregate?.aggregate?.sum?.balance ?? 0,
          collateralUtilization: 0,
          apy: 0,
          fee: 0,
        },
        collateralData: vault.collateral_balances.map((collateral) => {
          const asset = dipDupTokens.find(({ contract }) => contract === collateral.token?.token_address)
          return {
            assetSymbol: asset?.metadata.symbol,
            assetIcon: asset?.metadata.icon,
            balance: collateral.balance,
            ...(asset?.metadata.symbol ? { assetRate: tokensRates[asset.metadata.symbol] } : { assetRate: null }),
            maxWithdraw: 0,
          }
        }),
        borrowedAmount: vault.loan_outstanding_total,
        xtzDelegatedTo: '',
        operators: [],
        sMVKDelegatedTo: '',
        depositors: vault.vault?.depositors.map(({ depositor_id }) => depositor_id) as Array<string> | undefined,
      }

      if (vault.owner_id === userAddress) {
        acc.myBorrowingList.push(normallizedVault)
      }

      if (vault.vault?.depositors.find(({ depositor_id }) => depositor_id === userAddress)) {
        acc.permissinedBorrowingList.push(normallizedVault)
      }

      return acc
    },
    { myBorrowingList: [], permissinedBorrowingList: [] },
  )
}

const getCollateralTokens = (collateralTokens: Array<Lending_Controller_Collateral_Token>) => {
  return collateralTokens.map(({ token_address, balances_aggregate: { aggregate } }) => {
    return {
      tokenAddress: token_address,
      ...(aggregate?.sum?.balance ? { balance: aggregate?.sum?.balance } : {}),
    }
  })
}

export const getLoanTokensSymbols = ({
  storage,
  dipDupTokens,
}: {
  storage: LoansGQL
  dipDupTokens: State['tokens']['dipDupTokens']
}) => {
  return Array.from(
    storage?.loan_tokens?.reduce((acc, { lp_token_address, loan_token_name, vaults }) => {
      // Getting symbol metadata of loanToken
      const tokenInfo = dipDupTokens?.find(({ contract }) => contract === lp_token_address)
      acc.add(tokenInfo?.metadata.symbol ?? loan_token_name)

      // mapping througt vaults to get symbol of each collateral asset
      vaults.forEach(({ collateral_balances }) => {
        collateral_balances.forEach(({ token }) => {
          const collaretalTokenInfo = dipDupTokens?.find(({ contract }) => contract === token?.token_address)

          if (collaretalTokenInfo) {
            acc.add(collaretalTokenInfo.metadata.symbol)
          }
        })
      })
      return acc
    }, new Set<string>()) ?? new Set(),
  )
}

export const normalizeLoans = ({
  storage,
  dipDupTokens,
  mTokens,
  userMTokens,
  userAddres,
  tokensRate,
}: {
  storage: LoansGQL
  dipDupTokens: State['tokens']['dipDupTokens']
  mTokens: State['tokens']['mTokens']
  userMTokens: UserState['mTokens']
  userAddres?: string
  tokensRate: Record<string, number>
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

    const loanTokenMetadata = {
      name: loan_token_name,
      symbol: tokenInfo?.metadata.symbol,
      decimals: tokenInfo?.metadata.decimals,
      icon: tokenInfo?.metadata.icon,
      rate: tokensRate[tokenInfo?.metadata.symbol ?? loan_token_name] ?? null,
    }

    const { transactionHistory, totalBorrowed, totalLended } = getTransactionHistory(history_data, dipDupTokens)
    const { corratealAmount, borrowedAmount } = getCollateralTotal(vaults, dipDupTokens, tokensRate)
    const { myBorrowingList, permissinedBorrowingList } = getBorrowings(vaults, dipDupTokens, tokensRate, userAddres)
    const lendingItem = getLendingItem(loanToken, userMTokens, loanTokenMetadata, tokensRate)

    acc.push({
      loanTokenData: loanTokenMetadata,
      myBorrowingList,
      permissinedBorrowingList,
      lendingItem,
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
      totalFeesEarned: userMTokens?.reduce((acc, { rewards_earned }) => acc + rewards_earned, 0) ?? 0,
      // TODO: implement later, when sam will give the equations for it
      borrowAPR: 0,
      lendingAPY: 0,
    })
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

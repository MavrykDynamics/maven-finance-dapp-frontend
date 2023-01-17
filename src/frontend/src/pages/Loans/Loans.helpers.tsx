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
  AvaliableCollateralType,
  BorrowingData,
  LendingItemType,
  LoansChartsDataType,
  LoansGQL,
  LoanTokenType,
} from 'utils/TypesAndInterfaces/Loans'
import { calcWithoutDecimals, calcWithoutMu } from '../../utils/calcFunctions'

export const isTezosAsset = (assetAddress?: string) => assetAddress?.startsWith('tz')

// Normalizing transaction history
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

// Normalizing chart data
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

// Normalizing lending item for loan asset
const calcLendingAPY = (currentInterestRate: number, treasuryShare: number): number => {
  // ((1 + (currentInterestRate - treasuryShare)/secondsPerYear)^secondsPerYear - 1) * 100
  const secondsPerYear = 60 * 60 * 24 * 365

  const top = currentInterestRate - treasuryShare
  const firstTerm = 1 + top / secondsPerYear
  const power = firstTerm ** secondsPerYear
  return (power - 1) * 100
}

const getLendingItem = (
  loanToken: Lending_Controller_Loan_Token,
  userMTokens: UserState['mTokens'],
  userAssetBalances: Record<string, number>,
  interestTreasuryShare: number,
  interestRateDecimals: number,
): LendingItemType => {
  if (userMTokens && loanToken) {
    const mTokenAsset = userMTokens?.find(({ m_token_id }) => m_token_id === loanToken.lp_token_address)

    const tokenCurrentInterestRate = calcWithoutDecimals(loanToken.current_interest_rate, interestRateDecimals)

    if (mTokenAsset) {
      return {
        lendValue: mTokenAsset.balance,
        interestEarned: mTokenAsset.rewards_earned,
        mBalance: Number(mTokenAsset.balance) + Number(mTokenAsset.rewards_earned),
        // TODO: implement these values later
        loanAssetWalletBalance: userAssetBalances[loanToken.lp_token_address],
        lendAPY: calcLendingAPY(tokenCurrentInterestRate, interestTreasuryShare),
        borrowAPR: calcWithoutDecimals(loanToken.current_interest_rate, interestRateDecimals) * 100,
      }
    }
  }
  return null
}

// Normalizing borrowed items for loan asset
const getBorrowings = (
  loanTokenVaults: Array<Lending_Controller_Vault>,
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokensRates: Record<string, number>,
  userAddress?: string,
): {
  myBorrowingList: Array<BorrowingData>
  permissinedBorrowingList: Array<BorrowingData>
  totalCollateral: number
  totalBorrowed: number
} => {
  return loanTokenVaults.reduce<{
    myBorrowingList: Array<BorrowingData>
    permissinedBorrowingList: Array<BorrowingData>
    totalCollateral: number
    totalBorrowed: number
  }>(
    (acc, vault) => {
      const asset = dipDupTokens.find(({ contract }) => contract === vault.loan_token?.loan_token_address)

      console.log('vault', vault)

      const vaultCollateral = vault.collateral_balances.reduce<{
        normalizedCollaterals: BorrowingData['collateralData']
        totalRow: BorrowingData['collateralData'][number]
      }>(
        (acc, collateral) => {
          if (!collateral.token) return acc
          const asset = isTezosAsset(collateral.token.token_address)
            ? {
                metadata: {
                  symbol: 'tezos',
                  icon: '/images/tezos.png',
                },
              }
            : dipDupTokens.find(({ contract }) => contract === collateral.token?.token_address)

          acc.normalizedCollaterals.push({
            assetSymbol: asset?.metadata.symbol,
            assetIcon: asset?.metadata.icon,
            balance: collateral.balance,
            ...(asset?.metadata.symbol && tokensRates[asset.metadata.symbol]
              ? { assetRate: tokensRates[asset.metadata.symbol] }
              : { assetRate: 0.25 }),
            maxWithdraw: 0,
          })

          acc.totalRow.balance += collateral.balance
          acc.totalRow.maxWithdraw += 0

          return acc
        },
        {
          normalizedCollaterals: [],
          totalRow: {
            assetSymbol: 'total',
            balance: 0,
            assetRate: null,
            maxWithdraw: 0,
          },
        },
      )

      const isXTZ = isTezosAsset(vault.loan_token?.lp_token_address)
      const vaultAssetRate = tokensRates[isXTZ ? 'tezos' : asset?.metadata?.symbol ?? ''] ?? 0.25

      const normallizedVault = {
        borrowedAsset: {
          assetSymbol: asset?.metadata.symbol ?? vault.loan_token?.loan_token_name,
          ...(asset?.metadata.name ? { assetName: asset?.metadata.name } : {}),
          assetIcon: asset?.metadata.icon,
          amtBorrowed: 0,
          assetRate: vaultAssetRate,
          collateralBalance: vaultCollateral.totalRow?.balance ?? 0,
          collateralUtilization: 0,
          apy: 0,
          fee: 0,
        },
        collateralData: vaultCollateral.normalizedCollaterals.concat([vaultCollateral.totalRow]),
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

      acc.totalCollateral += vaultCollateral.totalRow.balance
      acc.totalBorrowed += normallizedVault.borrowedAmount * normallizedVault.borrowedAsset.assetRate

      return acc
    },
    { myBorrowingList: [], permissinedBorrowingList: [], totalCollateral: 0, totalBorrowed: 0 },
  )
}

// Normalizing loan asset
export const normalizeLoans = ({
  storage,
  dipDupTokens,
  mTokens,
  userMTokens,
  userAddres,
  tokensRate,
  userAssetBalances,
}: {
  storage: LoansGQL
  dipDupTokens: State['tokens']['dipDupTokens']
  mTokens: State['tokens']['mTokens']
  userMTokens: UserState['mTokens']
  userAddres?: string
  tokensRate: Record<string, number>
  userAssetBalances: Record<string, number>
}) => {
  const interestTreasuryShare = calcWithoutDecimals(storage?.interest_treasury_share, storage.decimals)
  const loanTokens = storage?.loan_tokens?.reduce<Array<LoanTokenType>>((acc, loanToken) => {
    const {
      lp_token_address,
      loan_token_name,
      utilisation_rate,
      total_remaining,
      history_data,
      vaults,
      reserve_ratio,
      token_pool_total,
      loan_token_contract_standard,
    } = loanToken

    const isXTZ = isTezosAsset(lp_token_address)
    const tokenInfo = dipDupTokens?.find(({ contract }) => contract === lp_token_address && !isXTZ)
    // TODO: add valid rate instead of 0.25
    const assetRate = tokensRate[isXTZ ? 'tezos' : tokenInfo?.metadata.symbol ?? loan_token_name] ?? 0.25

    const loanTokenMetadata = {
      name: isXTZ ? 'XTZ' : loan_token_name,
      symbol: isXTZ ? 'tezos' : tokenInfo?.metadata.symbol,
      decimals: isXTZ ? 6 : Number(tokenInfo?.metadata.decimals ?? 1),
      icon: isXTZ ? '/images/tezos.png' : tokenInfo?.metadata.icon,
      rate: assetRate,
      tokenType: loan_token_contract_standard as 'tez' | 'fa12' | 'fa2',
    }

    const { transactionHistory, totalBorrowed, totalLended } = getTransactionHistory(history_data, dipDupTokens)
    const {
      myBorrowingList,
      permissinedBorrowingList,
      totalCollateral,
      totalBorrowed: vaultsBorrowedAmount,
    } = getBorrowings(vaults, dipDupTokens, tokensRate, userAddres)

    const lendingItem = getLendingItem(
      loanToken,
      userMTokens,
      userAssetBalances,
      interestTreasuryShare,
      storage.interest_rate_decimals,
    )
    const totalLending = isXTZ
      ? calcWithoutMu(totalLended)
      : calcWithoutDecimals(totalLended, Number(tokenInfo?.metadata.decimals ?? 1))
    const availableLiquidity = isXTZ
      ? calcWithoutMu(total_remaining)
      : calcWithoutDecimals(total_remaining, Number(tokenInfo?.metadata.decimals ?? 1))

    // Temporary solution, cuz no data for no lended asset
    if (lendingItem) {
      acc.push({
        loanTokenData: loanTokenMetadata,
        myBorrowingList,
        permissionedBorrowingList: permissinedBorrowingList,
        lendingItem,
        transactionHistory,
        utilisationRate: utilisation_rate,
        totalBorrowed,
        borrowers: vaults.length,
        suppliers: mTokens.filter(({ loan_token_name: m_token_name }) => loan_token_name === m_token_name).length,
        collateral: totalCollateral,
        vaultsBorrowedAmount: vaultsBorrowedAmount,
        totalLending,
        availableLiquidity,
        totalFeesEarned: userMTokens?.reduce((acc, { rewards_earned }) => acc + rewards_earned, 0) ?? 0,
        collateralFactor: storage.collateral_ratio / 10,
        reserveFactor: reserve_ratio / 100,
        reserveAmount: (token_pool_total * reserve_ratio) / 100,
        borrowAPR: lendingItem?.borrowAPR ?? 0,
        lendingAPY: lendingItem?.lendAPY ?? 0,
      })
    }

    return acc
  }, [])

  return {
    loansControllerAddress: storage?.address,
    loanTokens,
    chartsData: getChartData(storage?.history_data),
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

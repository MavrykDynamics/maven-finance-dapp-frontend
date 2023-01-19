import dayjs from 'dayjs'
import { UTCTimestamp } from 'lightweight-charts'
import { State } from 'reducers'
import { UserState } from 'reducers/wallet'
import {
  Lending_Controller_History_Data,
  Lending_Controller_Loan_Token,
  Lending_Controller_Vault,
  Mavryk_User,
} from 'utils/generated/graphqlTypes'
import { parseDate } from 'utils/time'
import {
  BorrowingData,
  LendingItemType,
  LoansChartsDataType,
  LoansGQL,
  LoanTokenType,
  UserLendObjType,
} from 'utils/TypesAndInterfaces/Loans'
import { calcWithoutDecimals, calcWithoutMu } from '../../utils/calcFunctions'

export const isTezosAsset = (tokenName: string) => tokenName === 'tez'

export const getAssetMetadata = (
  tokenName: string,
  tokenAddress: string,
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokensRates: Record<string, number>,
):
  | {
      decimals: number
      name: string
      symbol: string
      icon: string
      address: string
      rate: number
    }
  | undefined => {
  const isXTZ = isTezosAsset(tokenName)
  const foundAssetInDipDup = dipDupTokens.find(
    ({ metadata: { name: dipDupName }, contract }) => tokenName === dipDupName || tokenAddress === contract,
  )

  if (isXTZ) {
    return {
      decimals: 6,
      name: 'XTZ',
      symbol: 'tezos',
      icon: '/images/tezos.png',
      rate: tokensRates['tezos'],
      address: tokenAddress,
    }
  }

  if (foundAssetInDipDup) {
    return {
      decimals: Number(foundAssetInDipDup.metadata.decimals),
      name: tokenName,
      symbol: foundAssetInDipDup.metadata.symbol,
      icon: foundAssetInDipDup.metadata.icon,
      rate: tokensRates[foundAssetInDipDup.metadata.symbol] ?? 0.25,
      address: tokenAddress,
    }
  }

  return
}

// Normalizing transaction history
const DAY_IN_MS = 86400000
const getTransactionHistory = (
  history_data: Lending_Controller_History_Data[],
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokensRates: Record<string, number>,
) =>
  history_data.reduce<{
    transactionHistory: LoanTokenType['transactionHistory']
    totalBorrowed: number
    totalLended: number
    lending24hVolume: number
    borrowing24hVolume: number
  }>(
    (acc, { type, amount, timestamp, sender_id, operation_hash, loan_token }) => {
      if (!loan_token) return acc

      const assetMetadata = getAssetMetadata(
        loan_token.loan_token_name,
        loan_token.lp_token_address,
        dipDupTokens,
        tokensRates,
      )

      if (assetMetadata) {
        const transformedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
        const descrByType = getDescrByType(type)
        if (descrByType) {
          acc.transactionHistory.push({
            amount: transformedAmount,
            date: parseDate({ time: new Date(timestamp).getTime(), timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC' }),
            userAddress: sender_id,
            operationHash: operation_hash,
            descr: getDescrByType(type),
            tokenSymbol: assetMetadata.symbol,
          })
        }

        if (type === 1 || type === 0) {
          acc.totalLended += transformedAmount

          if (dayjs().diff(timestamp) <= DAY_IN_MS) {
            acc.lending24hVolume += transformedAmount
          }
        }

        if (type === 3 || type === 2) {
          acc.totalBorrowed += transformedAmount

          if (dayjs().diff(timestamp) <= DAY_IN_MS) {
            acc.borrowing24hVolume += transformedAmount
          }
        }
      }

      return acc
    },
    { transactionHistory: [], totalBorrowed: 0, totalLended: 0, lending24hVolume: 0, borrowing24hVolume: 0 },
  )

// Normalizing chart data
const getChartData = (
  history_data: Lending_Controller_History_Data[],
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokensRates: Record<string, number>,
) =>
  history_data?.reduce<LoansChartsDataType>(
    (acc, { type, amount, timestamp, loan_token }) => {
      if (!loan_token) return acc
      const assetMetadata = getAssetMetadata(
        loan_token.loan_token_name,
        loan_token.loan_token_address,
        dipDupTokens,
        tokensRates,
      )

      if (assetMetadata) {
        switch (type) {
          case 0:
          case 1:
            const lendedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
            acc.totalLended += lendedAmount
            acc.lendingChartData.push({ time: new Date(timestamp).getTime() as UTCTimestamp, value: lendedAmount })
            break

          case 2:
          case 3:
            const borrowedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
            acc.totalBorrowed += borrowedAmount
            acc.borrowingChartData.push({ time: new Date(timestamp).getTime() as UTCTimestamp, value: borrowedAmount })
            break
        }
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
  loanTokenDecimals: number,
): LendingItemType => {
  if (userMTokens && loanToken) {
    const mTokenAsset = userMTokens?.find(({ m_token_id }) => m_token_id === loanToken.lp_token_address)

    const tokenCurrentInterestRate = calcWithoutDecimals(loanToken.current_interest_rate, interestRateDecimals)

    if (mTokenAsset) {
      return {
        lendValue: Number(mTokenAsset.balance) / 10 ** loanTokenDecimals,
        interestEarned: mTokenAsset.rewards_earned / 10 ** loanTokenDecimals,
        mBalance:
          Number(mTokenAsset.balance) / 10 ** loanTokenDecimals +
          Number(mTokenAsset.rewards_earned) / 10 ** loanTokenDecimals,
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
      if (!vault.loan_token) return acc

      const vaultCollateral = vault.collateral_balances.reduce<{
        normalizedCollaterals: BorrowingData['collateralData']
        totalRow: BorrowingData['collateralData'][number]
      }>(
        (acc, collateral) => {
          if (!collateral.token) return acc
          const collateralAsset = getAssetMetadata(
            collateral.token.token_name,
            collateral.token.token_address,
            dipDupTokens,
            tokensRates,
          )

          if (!collateralAsset) return acc

          const collateralBalance = (collateral.balance / 10 ** collateralAsset.decimals) * collateralAsset.rate

          acc.normalizedCollaterals.push({
            assetSymbol: collateralAsset.symbol,
            assetIcon: collateralAsset.icon,
            balance: collateralBalance,
            assetRate: collateralAsset.rate,
            maxWithdraw: 0,
          })

          acc.totalRow.balance += collateralBalance
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

      const uniqueBorrowers = Array.from(
        vault.vault?.lending_controller_vaults[0].history_data.reduce((acc, { sender_id }) => {
          acc.add(sender_id)
          return acc
        }, new Set<string>()) ?? [],
      )

      const vaultAsset = getAssetMetadata(
        vault.loan_token.loan_token_name,
        vault.loan_token.loan_token_address,
        dipDupTokens,
        tokensRates,
      )
      if (!vaultAsset) return acc

      const normallizedVault = {
        borrowedAsset: {
          assetSymbol: vaultAsset.symbol,
          assetName: vaultAsset.name,
          assetIcon: vaultAsset.icon,
          amtBorrowed: 0,
          assetRate: vaultAsset.rate,
          collateralBalance: vaultCollateral.totalRow.balance,
          collateralUtilization: 0,
          apy: 0,
          fee: 0,
        },
        collateralData: vaultCollateral.normalizedCollaterals.concat([vaultCollateral.totalRow]),
        borrowedAmount: vault.loan_outstanding_total,
        uniqueBorrowers,
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
  const interestRateDecimals = storage?.interest_rate_decimals ?? 0
  const loanTokens = storage?.loan_tokens?.reduce<Array<LoanTokenType>>((acc, loanToken) => {
    const {
      loan_token_address,
      loan_token_name,
      utilisation_rate,
      total_remaining,
      history_data,
      vaults,
      reserve_ratio,
      token_pool_total,
      loan_token_contract_standard,
      vaults_aggregate: { aggregate },
    } = loanToken

    const isXTZ = isTezosAsset(loan_token_name)
    const loanTokenMetadata = getAssetMetadata(loan_token_name, loan_token_address, dipDupTokens, tokensRate)
    const appropriateMtokenData = mTokens.find(({ loan_token_name: m_token_name }) => loan_token_name === m_token_name)
    if (!loanTokenMetadata) return acc

    const { transactionHistory, totalBorrowed, totalLended, lending24hVolume, borrowing24hVolume } =
      getTransactionHistory(history_data, dipDupTokens, tokensRate)
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
      loanTokenMetadata.decimals,
    )

    const availableLiquidity = isXTZ
      ? calcWithoutMu(total_remaining)
      : calcWithoutDecimals(total_remaining, Number(loanTokenMetadata.decimals ?? 1))

    // TODO: Temporary solution, cuz no data for no lended asset
    if (lendingItem) {
      acc.push({
        loanTokenData: {
          ...loanTokenMetadata,
          tokenType: loan_token_contract_standard as 'tez' | 'fa12' | 'fa2',
        },
        myBorrowingList,
        permissionedBorrowingList: permissinedBorrowingList,
        lendingItem,
        transactionHistory,
        utilisationRate: utilisation_rate / 10 ** interestRateDecimals,

        availableLiquidity,
        totalLended: totalLended,
        totalBorrowed,
        loanTokenTotalCollaterals: totalCollateral,
        loanTokenVaultsTotalBorrowed: vaultsBorrowedAmount,

        borrowers: aggregate?.count ?? 0,
        suppliers: appropriateMtokenData?.accounts.length ?? 0,
        lending24hVolume,
        borrowing24hVolume,

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
    chartsData: getChartData(storage?.history_data, dipDupTokens, tokensRate),
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
      return 'Withdrawed'
    case 6:
      return 'Deposited SMVK'
    case 7:
      return 'Withdrawed SMVK'
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

export const normalizeUserLending = ({
  dipDupTokens,
  userDataFromIndexer,
  tokensRate,
}: {
  dipDupTokens: State['tokens']['dipDupTokens']
  tokensRate: Record<string, number>
  userDataFromIndexer: Mavryk_User['lending_controller_history_data_sender']
}) => {
  return userDataFromIndexer.reduce<{
    userLendings: Array<UserLendObjType>
    userBorrowing: Array<UserLendObjType>
  }>(
    (
      acc,
      {
        type,
        loan_token,
        id,
        amount,
        operation_hash,
        lending_controller: { interest_rate_decimals, interest_treasury_share, decimals },
      },
    ) => {
      if (!loan_token) return acc
      const assetData = getAssetMetadata(
        loan_token.loan_token_name,
        loan_token.lp_token_address,
        dipDupTokens,
        tokensRate,
      )

      if (!assetData) return acc

      switch (type) {
        case 0:
        case 1:
          acc.userLendings.push({
            assetIcon: assetData.icon,
            assetName: assetData.name,
            id,
            amount: (amount / 10 ** assetData.decimals) * assetData.rate,
            annualPecentage: calcLendingAPY(
              calcWithoutDecimals(loan_token.current_interest_rate, interest_rate_decimals),
              calcWithoutDecimals(interest_treasury_share, decimals),
            ),
            earned: 0,
            operationHash: operation_hash,
          })
          break
        case 2:
        case 3:
          acc.userBorrowing.push({
            assetIcon: assetData.icon,
            assetName: assetData.name,
            id,
            amount: (amount / 10 ** assetData.decimals) * assetData.rate,
            annualPecentage: calcWithoutDecimals(loan_token.current_interest_rate, interest_rate_decimals) * 100,
            earned: 0,
            operationHash: operation_hash,
          })
          break
      }

      return acc
    },
    { userLendings: [], userBorrowing: [] },
  )
}

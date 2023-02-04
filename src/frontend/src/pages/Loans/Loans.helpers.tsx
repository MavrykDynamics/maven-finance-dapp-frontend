import dayjs from 'dayjs'
import { UTCTimestamp } from 'lightweight-charts'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'
import { State } from 'reducers'
import { UserState } from 'reducers/wallet'
import { BLOCKS_PER_MINUTE } from 'utils/constants'
import {
  Lending_Controller_History_Data,
  Lending_Controller_Loan_Token,
  Lending_Controller_Vault,
  Mavryk_User,
} from 'utils/generated/graphqlTypes'
import { parseDate } from 'utils/time'
import {
  LoansVaultType,
  LendingItemType,
  LoansChartsDataType,
  LoansGQL,
  LoanMarketType,
  LoanTokenType,
  UserLendObjType,
} from 'utils/TypesAndInterfaces/Loans'
import { calcWithoutDecimals, calcWithoutMu } from '../../utils/calcFunctions'
import { getUserBalanceForLoanAsset } from './LoansFethcers'

export const isTezosAsset = (tokenName: string) => tokenName === 'tez'

export const getAssetMetadata = ({
  tokenName,
  tokenAddress,
  dipDupTokens,
  feeds,
  oracleId,
}: {
  tokenName: string
  tokenAddress: string
  dipDupTokens: State['tokens']['dipDupTokens']
  feeds: Array<Feed>
  oracleId?: string
}):
  | {
      decimals: number
      name: string
      symbol: string
      originalName: string
      icon: string
      address: string
      rate: number
      id: number
    }
  | undefined => {
  const isXTZ = isTezosAsset(tokenName)
  const foundAssetInDipDup = dipDupTokens.find(
    ({ metadata: { name: dipDupName }, contract }) => tokenName === dipDupName || tokenAddress === contract,
  )

  const { last_completed_data, decimals, icon } = feeds.find(({ address }) => address === oracleId) ?? {}

  if (isXTZ && last_completed_data !== undefined && decimals !== undefined) {
    return {
      decimals: 6,
      originalName: tokenName,
      name: 'Tezos',
      symbol: 'XTZ',
      icon: '/images/tezos.png',
      rate: last_completed_data / 10 ** decimals,
      address: tokenAddress,
      // TODO: ensure it's really 3
      id: 3,
    }
  }

  if (foundAssetInDipDup && last_completed_data !== undefined && decimals !== undefined) {
    return {
      decimals: Number(foundAssetInDipDup.metadata.decimals),
      originalName: tokenName,
      name: foundAssetInDipDup.metadata.name,
      symbol: foundAssetInDipDup.metadata.symbol,
      icon: tokenName === 'eurl' ? '/images/eurl.png' : foundAssetInDipDup.metadata.icon ?? icon,
      rate: last_completed_data / 10 ** decimals,
      address: tokenAddress,
      id: foundAssetInDipDup.id,
    }
  }

  return
}

// Normalizing transaction history
const DAY_IN_MS = 86400000
const getTransactionHistory = (
  history_data: Lending_Controller_History_Data[],
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: State['oracles']['oraclesStorage']['feeds'],
) =>
  history_data.reduce<{
    transactionHistory: LoanMarketType['transactionHistory']
    totalBorrowed: number
    totalLended: number
    lending24hVolume: number
    borrowing24hVolume: number
  }>(
    (acc, { type, amount, timestamp, sender_id, operation_hash, loan_token }) => {
      if (!loan_token) return acc

      const assetMetadata = getAssetMetadata({
        tokenAddress: loan_token.loan_token_address,
        tokenName: loan_token.loan_token_name,
        dipDupTokens,
        feeds,
        oracleId: String(loan_token.oracle_id),
      })

      if (assetMetadata) {
        const transformedAmount = amount / 10 ** assetMetadata.decimals
        const descrByType = getDescrByType(type)
        if (descrByType) {
          acc.transactionHistory.push({
            amount: transformedAmount * assetMetadata.rate,
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
            acc.lending24hVolume += transformedAmount * assetMetadata.rate
          }
        }

        if (type === 3 || type === 2) {
          acc.totalBorrowed += transformedAmount

          if (dayjs().diff(timestamp) <= DAY_IN_MS) {
            acc.borrowing24hVolume += transformedAmount * assetMetadata.rate
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
  feeds: State['oracles']['oraclesStorage']['feeds'],
) =>
  history_data?.reduce<LoansChartsDataType>(
    (acc, { type, amount, timestamp, loan_token }) => {
      if (!loan_token) return acc
      const assetMetadata = getAssetMetadata({
        tokenAddress: loan_token.loan_token_address,
        tokenName: loan_token.loan_token_name,
        dipDupTokens,
        feeds,
        oracleId: String(loan_token.oracle_id),
      })

      if (assetMetadata) {
        switch (type) {
          case 0:
          case 1:
            const lendedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
            acc.totalLended += lendedAmount
            acc.lendingChartData.push({ time: new Date(timestamp).getTime() as UTCTimestamp, value: acc.totalLended })
            break

          case 2:
          case 3:
            const borrowedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
            acc.totalBorrowed += borrowedAmount
            acc.borrowingChartData.push({
              time: new Date(timestamp).getTime() as UTCTimestamp,
              value: acc.totalBorrowed,
            })
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
  loanTokenDecimals: number,
  accountPkh?: string,
): LendingItemType => {
  if (userMTokens && loanToken && accountPkh) {
    const mTokenAsset = userMTokens?.find(({ m_token_id }) => m_token_id === loanToken.lp_token_address)

    if (mTokenAsset) {
      return {
        lendValue: Number(mTokenAsset.balance) / 10 ** loanTokenDecimals,
        interestEarned: mTokenAsset.rewards_earned / 10 ** loanTokenDecimals,
        mBalance:
          Number(mTokenAsset.balance) / 10 ** loanTokenDecimals +
          Number(mTokenAsset.rewards_earned) / 10 ** loanTokenDecimals,
      }
    }
  }
  return null
}

// Normalizing borrowed items for loan asset
type BorrowingNormalizerReturnType = {
  myBorrowingList: Array<LoansVaultType>
  permissinedBorrowingList: Array<LoansVaultType>
  totalCollateral: number
  vaultsBorrowedAmount: number
}

export const calculateCompoundedInterest = (
  interestRate: number,
  lastUpdatedBlockLevel: number,
  blockLevel: number,
) => {
  let interestRateOverSecondsInYear = Math.trunc(interestRate / 31536000)
  let exp = blockLevel - lastUpdatedBlockLevel

  let expMinusOne = exp - 1
  let expMinusTwo = exp - 2

  let basePowerTwo = Math.trunc(interestRateOverSecondsInYear ** 2 / 31536000 ** 2)
  let basePowerThree = Math.trunc(interestRateOverSecondsInYear ** 3 / 31536000 ** 3)

  let firstTerm = Math.trunc(exp * interestRateOverSecondsInYear)
  let secondTerm = Math.trunc((exp * expMinusOne * basePowerTwo) / 2)
  let thirdTerm = Math.trunc((exp * expMinusOne * expMinusTwo * basePowerThree) / 6)

  let compoundedInterest = 10 ** 27 + firstTerm + secondTerm + thirdTerm

  return compoundedInterest
}

export const calcCollateralRatio = (collateralAmount: number, borrowedAmount: number, borrowedAssetRate: number) => {
  // means we haven't borrowed anything
  if (collateralAmount === 0) return 0

  // means we haven't borrowed, but we have deposited
  if (borrowedAmount === 0) return 251

  return (collateralAmount / (borrowedAmount * borrowedAssetRate)) * 100
}

const getBorrowings = async (
  loanTokenVaults: Array<Lending_Controller_Vault>,
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: State['oracles']['oraclesStorage']['feeds'],
  interestRateDecimals: number,
  userAddress?: string,
): Promise<BorrowingNormalizerReturnType> => {
  try {
    return await loanTokenVaults.reduce<Promise<BorrowingNormalizerReturnType>>(async (promiseAcc, vault) => {
      const acc = await promiseAcc
      if (!vault.loan_token || !vault.vault || !userAddress) return acc

      const vaultCollateral = vault.collateral_balances.reduce<{
        normalizedCollaterals: LoansVaultType['collateralData']
        totalRow: LoansVaultType['collateralData'][number]
      }>(
        (acc, collateral) => {
          if (!collateral.token) return acc
          const collateralAsset = getAssetMetadata({
            tokenName: collateral.token.token_name,
            tokenAddress: collateral.token.token_address,
            dipDupTokens,
            feeds,
            oracleId: String(collateral.token.oracle_id),
          })

          if (!collateralAsset) return acc

          const collateralBalance = collateral.balance / 10 ** collateralAsset.decimals

          acc.normalizedCollaterals.push({
            symbol: collateralAsset.symbol,
            name: collateralAsset.name,
            gqlName: collateralAsset.originalName,
            icon: collateralAsset.icon,
            id: collateralAsset.id,
            decimals: collateralAsset.decimals,
            amount: collateralBalance,
            rate: collateralAsset.rate,
            maxWithdraw: 0,
          })

          acc.totalRow.amount += collateralBalance * collateralAsset.rate
          acc.totalRow.maxWithdraw += 0

          return acc
        },
        {
          normalizedCollaterals: [],
          totalRow: {
            symbol: 'total',
            amount: 0,
            rate: 0,
            maxWithdraw: 0,
            name: '',
            gqlName: '',
            icon: '',
            id: 0,
            decimals: 0,
          },
        },
      )

      const currentInterestRate = calcWithoutDecimals(
        vault.loan_token?.current_interest_rate ?? 0,
        interestRateDecimals,
      )
      const vaultXtzDelegatedTo = await (
        await fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/contracts/${vault.vault.address}`)
      ).json()

      const currentBlock = await (
        await fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/blocks/${dayjs().toISOString()}`)
      ).json()

      const fee =
        calculateCompoundedInterest(currentInterestRate, vault.last_updated_block_level, currentBlock?.level ?? 0) /
        10 ** interestRateDecimals

      const vaultAsset = getAssetMetadata({
        tokenName: vault.loan_token.loan_token_name,
        tokenAddress: vault.loan_token.loan_token_address,
        dipDupTokens,
        feeds,
        oracleId: String(vault.loan_token.oracle_id),
      })

      const userBalance = await getUserBalanceForLoanAsset(
        vault.loan_token.loan_token_address,
        vault.loan_token.loan_token_name,
        userAddress,
      )
      if (!vaultAsset) return acc

      const borrowedAmount = vault.vault.lending_controller_vaults[0].loan_outstanding_total / 10 ** vaultAsset.decimals

      const collateralRatio = calcCollateralRatio(vaultCollateral.totalRow.amount, borrowedAmount, vaultAsset.rate)
      const collateralData = vaultCollateral.normalizedCollaterals.length
        ? [...vaultCollateral.normalizedCollaterals, vaultCollateral.totalRow]
        : []

      const normallizedVault = {
        borrowedAsset: {
          symbol: vaultAsset.symbol,
          name: vaultAsset.name,
          icon: vaultAsset.icon,
          decimals: vaultAsset.decimals,
          gqlName: vaultAsset.originalName,
          tokenType: vault.loan_token.loan_token_contract_standard as LoanTokenType,
          id: vaultAsset.id,
          userBalance,
          rate: vaultAsset.rate,
        },

        collateralBalance: vaultCollateral.totalRow.amount,
        borrowCapacity: vaultCollateral.totalRow.amount / 2 - borrowedAmount,
        collateralRatio,
        apr: currentInterestRate * 100,
        fee: borrowedAmount === 0 ? 0 : fee,
        repayFee: vault.loan_interest_total,
        address: vault.vault.address,
        vaultId: vault.id,
        collateralData,
        borrowedAmount,

        levelOfEarly: currentBlock?.level ?? 0,
        levelOfLate:
          vault.marked_for_liquidation_level +
          Number(vault.lending_controller?.liquidation_delay_in_minutes) * BLOCKS_PER_MINUTE,

        xtzDelegatedTo: vaultXtzDelegatedTo?.delegate?.address ?? null,
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

      acc.totalCollateral += vaultCollateral.totalRow.amount
      acc.vaultsBorrowedAmount += normallizedVault.borrowedAmount * normallizedVault.borrowedAsset.rate

      return acc
    }, Promise.resolve({ myBorrowingList: [], permissinedBorrowingList: [], totalCollateral: 0, vaultsBorrowedAmount: 0 }))
  } catch (e) {
    console.log('getBorrowings error', e)
    return { myBorrowingList: [], permissinedBorrowingList: [], totalCollateral: 0, vaultsBorrowedAmount: 0 }
  }
}

// Normalizing loan asset
export const normalizeLoans = async ({
  storage,
  dipDupData,
  mTokens,
  userMTokens,
  userAddres,
  feeds,
}: {
  storage: LoansGQL
  dipDupData: State['tokens']['dipDupTokens']
  mTokens: State['tokens']['mTokens']
  userMTokens: UserState['mTokens']
  userAddres?: string
  feeds: State['oracles']['oraclesStorage']['feeds']
}) => {
  try {
    const interestTreasuryShare = calcWithoutDecimals(storage?.interest_treasury_share, storage.decimals)
    const interestRateDecimals = storage?.interest_rate_decimals ?? 0
    const loanTokens = await storage?.loan_tokens?.reduce<Promise<Array<LoanMarketType>>>(
      async (promiseAcc, loanToken) => {
        const acc: LoanMarketType[] = await promiseAcc

        const {
          loan_token_name,
          utilisation_rate,
          total_remaining,
          history_data,
          vaults,
          reserve_ratio,
          token_pool_total,
          loan_token_address,
          loan_token_contract_standard,
          oracle_id,
          vaults_aggregate: { aggregate },
        } = loanToken

        const isXTZ = isTezosAsset(loan_token_name)
        const loanTokenMetadata = getAssetMetadata({
          tokenName: loan_token_name,
          tokenAddress: loan_token_address,
          dipDupTokens: dipDupData,
          feeds,
          oracleId: String(oracle_id),
        })
        const appropriateMtokenData = mTokens.find(
          ({ loan_token_name: m_token_name }) => loan_token_name === m_token_name,
        )

        if (!loanTokenMetadata) return acc

        const { transactionHistory, totalBorrowed, totalLended, lending24hVolume, borrowing24hVolume } =
          getTransactionHistory(history_data, dipDupData, feeds)
        const { myBorrowingList, permissinedBorrowingList, totalCollateral, vaultsBorrowedAmount } =
          await getBorrowings(vaults, dipDupData, feeds, interestRateDecimals, userAddres)
        const lendingItem = getLendingItem(loanToken, userMTokens, loanTokenMetadata.decimals, userAddres)

        const loanTokenUserBalance = await getUserBalanceForLoanAsset(loan_token_address, loan_token_name, userAddres)
        const reservePercent = reserve_ratio / 10000
        const reserveAmountMu = token_pool_total * reservePercent
        const reserveAmount = isXTZ
          ? calcWithoutMu(reserveAmountMu)
          : calcWithoutDecimals(reserveAmountMu, Number(loanTokenMetadata.decimals ?? 1))
        const availableLiquidity = isXTZ
          ? calcWithoutMu(total_remaining - reserveAmountMu)
          : calcWithoutDecimals(total_remaining - reserveAmountMu, Number(loanTokenMetadata.decimals ?? 1))

        const totalSupplied = isXTZ
          ? calcWithoutMu(token_pool_total)
          : calcWithoutDecimals(token_pool_total, Number(loanTokenMetadata.decimals ?? 1))
        const totalBorrowedCurrent = isXTZ
          ? calcWithoutMu(token_pool_total - total_remaining)
          : calcWithoutDecimals(token_pool_total - total_remaining, Number(loanTokenMetadata.decimals ?? 1))

        const tokenCurrentInterestRate = calcWithoutDecimals(loanToken.current_interest_rate, interestRateDecimals)
        const lendAPY = calcLendingAPY(tokenCurrentInterestRate, interestTreasuryShare)
        const borrowAPR = tokenCurrentInterestRate * 100

        acc.push({
          loanTokenData: {
            ...loanTokenMetadata,
            tokenType: loan_token_contract_standard as LoanTokenType,
            userBalance: loanTokenUserBalance,
            gqlName: loanTokenMetadata.originalName,
            symbol: loanTokenMetadata.symbol,
            name: loanTokenMetadata.name,
            rate: loanTokenMetadata.rate,
            decimals: loanTokenMetadata.decimals,
            id: loanTokenMetadata.id,
            icon: loanTokenMetadata.icon,
          },
          myBorrowingList,
          permissionedBorrowingList: permissinedBorrowingList,
          lendingItem,
          transactionHistory,
          utilisationRate: utilisation_rate / 10 ** interestRateDecimals,

          availableLiquidity,
          totalLended: totalSupplied,
          totalBorrowed: totalBorrowedCurrent,
          loanTokenTotalCollaterals: totalCollateral,
          loanTokenVaultsTotalBorrowed: vaultsBorrowedAmount,

          borrowers: aggregate?.count ?? 0,
          suppliers: appropriateMtokenData?.accounts.length ?? 0,
          lending24hVolume,
          borrowing24hVolume,

          totalFeesEarned: userMTokens?.reduce((acc, { rewards_earned }) => acc + rewards_earned, 0) ?? 0,
          collateralFactor: storage.collateral_ratio / 10,
          reserveFactor: reserve_ratio / 100,
          reserveAmount: reserveAmount,
          borrowAPR: borrowAPR,
          lendingAPY: lendAPY,
        })

        return acc
      },
      Promise.resolve([]),
    )

    return {
      loansControllerAddress: storage?.address,
      loanTokens,
      chartsData: getChartData(storage?.history_data, dipDupData, feeds),
      config: {
        DAOFee: (storage?.minimum_loan_fee_pct ?? 0) / 100,
      },
    }
  } catch (e) {
    console.log('normalizeLoans error:', e)
    return {
      loansControllerAddress: storage?.address,
      chartsData: getChartData(storage?.history_data, dipDupData, feeds),
      loanTokens: [],
      config: {
        DAOFee: (storage?.minimum_loan_fee_pct ?? 0) / 100,
      },
    }
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
  feeds,
}: {
  dipDupTokens: State['tokens']['dipDupTokens']
  feeds: State['oracles']['oraclesStorage']['feeds']
  userDataFromIndexer: Mavryk_User['lending_controller_history_data_sender']
}) => {
  return (
    userDataFromIndexer?.reduce<{
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
        const assetData = getAssetMetadata({
          tokenAddress: loan_token.loan_token_address,
          tokenName: loan_token.loan_token_name,
          dipDupTokens,
          feeds,
          oracleId: String(loan_token.oracle_id),
        })

        if (!assetData) return acc

        switch (type) {
          case 0:
          case 1:
            acc.userLendings.push({
              icon: assetData.icon,
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
              icon: assetData.icon,
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
    ) ?? { userLendings: [], userBorrowing: [] }
  )
}

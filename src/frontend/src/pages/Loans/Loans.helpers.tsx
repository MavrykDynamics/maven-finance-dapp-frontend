import dayjs from 'dayjs'
import { SingleValueData, UTCTimestamp } from 'lightweight-charts'
import { State } from 'reducers'
import { UserState } from 'reducers/wallet'
import { BLOCKS_PER_MINUTE, FIXED_POINT_ACCURACY, SECONDS_PER_YEAR } from 'utils/constants'
import {
  Lending_Controller_History_Data,
  Lending_Controller_Loan_Token,
  Lending_Controller_Vault,
  Mavryk_User,
} from 'utils/generated/graphqlTypes'
import { parseDate } from 'utils/time'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import {
  LoansVaultType,
  LendingItemType,
  LoansChartsDataType,
  LoansGQL,
  LoanMarketType,
  UserLendObjType,
  BaseLoansAssetDataType,
  DepositorsFlagType,
} from 'utils/TypesAndInterfaces/Loans'
import { calcWithoutDecimals, calcWithoutMu, convertNumberForClient } from '../../utils/calcFunctions'
import { ANY_USER, NONE_USER, WHITELIST_USERS } from './Loans.const'
import { getUserBalanceForLoanAsset } from './LoansFethcers'

export const isTezosAsset = (tokenName: string) => tokenName === 'tez' || tokenName === 'tezos'

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
}): (BaseLoansAssetDataType & { address: string }) | undefined => {
  const isXTZ = isTezosAsset(tokenName)
  const foundAssetInDipDup = dipDupTokens.find(
    ({ metadata: { name: dipDupName }, contract }) => tokenName === dipDupName || tokenAddress === contract,
  )

  const { last_completed_data, decimals, icon } = feeds.find(({ address }) => address === oracleId) ?? {}

  if (isXTZ && last_completed_data !== undefined && decimals !== undefined) {
    return {
      decimals: 6,
      gqlName: tokenName,
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
      gqlName: tokenName,
      name: foundAssetInDipDup.metadata.name,
      symbol: foundAssetInDipDup.metadata.symbol,
      icon:
        tokenName === 'eurl'
          ? '/images/eurl.png'
          : tokenName === 'tzbtc'
          ? '/images/tzBTC.png'
          : icon ?? foundAssetInDipDup.metadata.icon,
      rate: last_completed_data / 10 ** decimals,
      address: tokenAddress,
      id: foundAssetInDipDup.id,
    }
  }

  return
}

type TransactionHistoryReduceType = {
  transactionHistory: LoanMarketType['transactionHistory']
  totalBorrowed: number
  totalLended: number
  lending24hVolume: number
  borrowing24hVolume: number
  marketCollateralChartData: Array<SingleValueData>
  marketLiquidityChartData: Array<SingleValueData>
}

// Normalizing transaction history
const DAY_IN_MS = 86400000
const getTransactionHistory = (
  history_data: Lending_Controller_History_Data[],
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: State['dataFeeds']['feedsLedger'],
) =>
  history_data.reduce<TransactionHistoryReduceType>(
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
            amount: transformedAmount,
            date: parseDate({ time: new Date(timestamp).getTime(), timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC' }),
            userAddress: sender_id,
            operationHash: operation_hash,
            descr: getDescrByType(type),
            tokenSymbol: assetMetadata.symbol,
          })
        }

        // Added liquidity (lended)
        if (type === 0) {
          acc.totalLended += transformedAmount

          if (dayjs().diff(timestamp) <= DAY_IN_MS) {
            acc.lending24hVolume += transformedAmount * assetMetadata.rate
          }

          // TODO: add valid time diff checking
          if (dayjs().diff(timestamp) <= DAY_IN_MS) {
            acc.marketLiquidityChartData.push({
              value: (acc.marketLiquidityChartData.at(-1)?.value ?? 0) + transformedAmount * assetMetadata.rate,
              time: new Date(timestamp).getTime() as UTCTimestamp,
            })
          }
        }

        // Removed liquidity (paid lended)
        if (type === 1) {
          acc.totalLended -= transformedAmount

          if (dayjs().diff(timestamp) <= DAY_IN_MS) {
            acc.lending24hVolume -= transformedAmount * assetMetadata.rate
          }

          // TODO: add valid time diff checking
          if (dayjs().diff(timestamp) <= DAY_IN_MS) {
            acc.marketCollateralChartData.push({
              value: (acc.marketLiquidityChartData.at(-1)?.value ?? 0) - transformedAmount * assetMetadata.rate,
              time: new Date(timestamp).getTime() as UTCTimestamp,
            })
          }
        }

        // Borrowed
        if (type === 2) {
          acc.totalBorrowed += transformedAmount

          if (dayjs().diff(timestamp) <= DAY_IN_MS) {
            acc.borrowing24hVolume += transformedAmount * assetMetadata.rate
          }
        }

        // Paid borrowed (repaid)
        if (type === 3) {
          acc.totalBorrowed -= transformedAmount

          if (dayjs().diff(timestamp) <= DAY_IN_MS) {
            acc.borrowing24hVolume -= transformedAmount * assetMetadata.rate
          }
        }

        // TODO: add valid time diff checking
        // Deposit collateral
        if ((type === 4 || type === 6) && dayjs().diff(timestamp) <= DAY_IN_MS) {
          acc.marketCollateralChartData.push({
            value: (acc.marketCollateralChartData.at(-1)?.value ?? 0) + transformedAmount * assetMetadata.rate,
            time: new Date(timestamp).getTime() as UTCTimestamp,
          })
        }

        // TODO: add valid time diff checking
        // Withdraw collateral
        if ((type === 5 || type === 7) && dayjs().diff(timestamp) <= DAY_IN_MS) {
          acc.marketCollateralChartData.push({
            value: (acc.marketCollateralChartData.at(-1)?.value ?? 0) - transformedAmount * assetMetadata.rate,
            time: new Date(timestamp).getTime() as UTCTimestamp,
          })
        }
      }

      return acc
    },
    {
      transactionHistory: [],
      marketCollateralChartData: [],
      marketLiquidityChartData: [],
      totalBorrowed: 0,
      totalLended: 0,
      lending24hVolume: 0,
      borrowing24hVolume: 0,
    },
  )

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000
// Normalizing chart data
const getChartData = (
  history_data: Lending_Controller_History_Data[],
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: State['dataFeeds']['feedsLedger'],
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
        const operationTimestampAndNowDiffInMs = new Date(Date.now()).getTime() - new Date(timestamp).getTime()
        const isLast24hOperation = operationTimestampAndNowDiffInMs <= ONE_DAY_IN_MS
        const islast48hOperation =
          operationTimestampAndNowDiffInMs <= ONE_DAY_IN_MS * 2 && operationTimestampAndNowDiffInMs >= ONE_DAY_IN_MS

        // Added liquidity (lended)
        if (type === 0) {
          const lendedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
          if (isLast24hOperation) {
            acc.lendBorrow24hDiff.last24hLending += lendedAmount
          }

          if (islast48hOperation) {
            acc.lendBorrow24hDiff.last48hLending += lendedAmount
          }
          acc.totalLended += lendedAmount
          acc.lendingChartData.push({ time: new Date(timestamp).getTime() as UTCTimestamp, value: acc.totalLended })
        }

        // Removed liquidity (paid lended)
        if (type === 1) {
          const lendedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
          if (isLast24hOperation) {
            acc.lendBorrow24hDiff.last24hLending -= lendedAmount
          }

          if (islast48hOperation) {
            acc.lendBorrow24hDiff.last48hLending -= lendedAmount
          }
          acc.totalLended += lendedAmount
          acc.lendingChartData.push({ time: new Date(timestamp).getTime() as UTCTimestamp, value: acc.totalLended })
        }

        // Borrowed
        if (type === 2) {
          const borrowedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
          if (isLast24hOperation) {
            acc.lendBorrow24hDiff.last24hBorrowing += borrowedAmount
          }

          if (islast48hOperation) {
            acc.lendBorrow24hDiff.last48hBorrowing += borrowedAmount
          }
          acc.totalBorrowed += borrowedAmount
          acc.borrowingChartData.push({
            time: new Date(timestamp).getTime() as UTCTimestamp,
            value: acc.totalBorrowed,
          })
        }

        // Paid borrowed (repaid)
        if (type === 3) {
          const borrowedAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
          if (isLast24hOperation) {
            acc.lendBorrow24hDiff.last24hBorrowing -= borrowedAmount
          }

          if (islast48hOperation) {
            acc.lendBorrow24hDiff.last48hBorrowing -= borrowedAmount
          }
          acc.totalBorrowed += borrowedAmount
          acc.borrowingChartData.push({
            time: new Date(timestamp).getTime() as UTCTimestamp,
            value: acc.totalBorrowed,
          })
        }

        // Deposit collateral
        if (type === 4 || type === 6) {
          const collateralAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
          acc.collateralChartData.push({
            value: (acc.collateralChartData.at(-1)?.value ?? 0) + collateralAmount,
            time: new Date(timestamp).getTime() as UTCTimestamp,
          })
        }

        // Withdraw collateral
        if (type === 5 || type === 7) {
          const collateralAmount = (amount / 10 ** assetMetadata.decimals) * assetMetadata.rate
          acc.collateralChartData.push({
            value: (acc.collateralChartData.at(-1)?.value ?? 0) - collateralAmount,
            time: new Date(timestamp).getTime() as UTCTimestamp,
          })
        }
      }

      return acc
    },
    {
      totalBorrowed: 0,
      borrowingChartData: [],
      collateralChartData: [],
      totalLended: 0,
      lendingChartData: [],
      lendBorrow24hDiff: {
        last48hLending: 0,
        last24hLending: 0,
        last48hBorrowing: 0,
        last24hBorrowing: 0,
      },
    },
  )

// Normalizing lending item for loan asset
const calcLendingAPY = (currentInterestRate: number, treasuryShare: number): number => {
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
  interestRateDecimals: number,
  accountPkh?: string,
): LendingItemType => {
  console.log({
    userMTokens,
    loanToken,
    accountPkh,
  })
  if (userMTokens && loanToken && accountPkh) {
    const mTokenAsset = userMTokens?.find(
      ({ m_token_id, m_token: { loan_token_name } }) =>
        m_token_id === loanToken.loan_token_address || loan_token_name === loanToken.loan_token_name,
    )

    console.log({ mTokenAsset })
    if (mTokenAsset) {
      return {
        lendValue: Number(mTokenAsset.balance) / 10 ** loanTokenDecimals,
        interestEarned: Number(mTokenAsset.rewards_earned) / 10 ** interestRateDecimals / 10 ** loanTokenDecimals,
        mBalance:
          Number(mTokenAsset.balance) / 10 ** loanTokenDecimals +
          Number(mTokenAsset.rewards_earned) / 10 ** interestRateDecimals / 10 ** loanTokenDecimals,
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
  let interestRateOverSecondsInYear = Math.trunc(interestRate / SECONDS_PER_YEAR)
  let exp = blockLevel - lastUpdatedBlockLevel

  let expMinusOne = exp - 1
  let expMinusTwo = exp - 2

  let basePowerTwo = Math.trunc(interestRateOverSecondsInYear ** 2 / SECONDS_PER_YEAR ** 2)
  let basePowerThree = Math.trunc(interestRateOverSecondsInYear ** 3 / SECONDS_PER_YEAR ** 3)

  let firstTerm = Math.trunc(exp * interestRateOverSecondsInYear)
  let secondTerm = Math.trunc((exp * expMinusOne * basePowerTwo) / 2)
  let thirdTerm = Math.trunc((exp * expMinusOne * expMinusTwo * basePowerThree) / 6)

  let compoundedInterest = FIXED_POINT_ACCURACY + firstTerm + secondTerm + thirdTerm

  return compoundedInterest
}

export const calcCollateralRatio = (collateralAmount: number, borrowedAmount: number, borrowedAssetRate: number) => {
  // means we haven't borrowed anything
  if (collateralAmount === 0) return 0

  // means we haven't borrowed, but we have deposited
  if (borrowedAmount === 0) return 251

  const collateralRatio = (collateralAmount / Math.max(1, borrowedAmount * borrowedAssetRate)) * 100
  return Number(collateralRatio.toFixed(1))
}

export const getMaxCollateralWithdraw = (
  currentCollateralAmount: number,
  totalCollateralAmount: number,
  borrowedAmount: number,
  borrowedAssetRate: number,
  collarealAssetRate: number,
): number => {
  // If vault is not borrowed we can withdraw all amount
  if (borrowedAmount === 0) return currentCollateralAmount / collarealAssetRate
  /**
   * @collateralNeedsToBe is now much collateralAmount i need to left for current borrowed amount
   * 200 ratio in persent the smallest we can get, <200 vault is under collateralization
   * 100 is to transform % => number
   * (borrowedAmount * borrowedAssetRate) how much has been borrowed from the vault
   */
  const collateralNeedsToBe = (200 / 100) * (borrowedAmount * borrowedAssetRate)
  return Math.min(totalCollateralAmount - collateralNeedsToBe, currentCollateralAmount) / collarealAssetRate
}

const getBorrowings = async (
  loanTokenVaults: Array<Lending_Controller_Vault>,
  dipDupTokens: State['tokens']['dipDupTokens'],
  feeds: State['dataFeeds']['feedsLedger'],
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
            ...collateralAsset,
            amount: collateralBalance,
          })

          acc.totalRow.amount += Number((collateralBalance * collateralAsset.rate).toFixed(2))

          return acc
        },
        {
          normalizedCollaterals: [],
          totalRow: {
            symbol: 'total',
            amount: 0,
            rate: 0,
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

      // Calculating Fee of the vault
      const accruedInterest =
        borrowedAmount === 0
          ? 0
          : calculateAccruedInterest(vault.loan_outstanding_total, vault.borrow_index, vault.loan_token.borrow_index) /
            FIXED_POINT_ACCURACY

      const collateralRatio = calcCollateralRatio(vaultCollateral.totalRow.amount, borrowedAmount, vaultAsset.rate)
      const collateralData = vaultCollateral.normalizedCollaterals.length
        ? [...vaultCollateral.normalizedCollaterals, vaultCollateral.totalRow]
        : []

      const borrowCapacity = vaultCollateral.totalRow.amount / 2 - borrowedAmount * vaultAsset.rate

      const depositors = (vault.vault?.depositors.map(({ depositor_id }) => depositor_id).filter(Boolean) ??
        []) as Array<string>
      const deporsitorsFlag: DepositorsFlagType =
        vault.vault.allowance === 0
          ? ANY_USER
          : vault.vault.allowance === 1 && depositors.length !== 0
          ? WHITELIST_USERS
          : NONE_USER

      const normallizedVault = {
        borrowedAsset: {
          ...vaultAsset,
          tokenType: vault.loan_token.loan_token_contract_standard as TokenType,
          userBalance,
        },
        name: vault.vault.name,

        collateralBalance: vaultCollateral.totalRow.amount,
        borrowCapacity,
        collateralRatio,
        apr: currentInterestRate * 100,
        fee: accruedInterest,
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
        deporsitorsFlag,
        depositors,
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
  feeds: State['dataFeeds']['feedsLedger']
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

        const reservePercent = reserve_ratio / 10000
        const reserveAmountMu = token_pool_total * reservePercent
        const reserveAmount = isXTZ
          ? calcWithoutMu(reserveAmountMu)
          : calcWithoutDecimals(reserveAmountMu, Number(loanTokenMetadata.decimals ?? 1))
        const availableLiquidity = isXTZ
          ? calcWithoutMu(total_remaining - reserveAmountMu)
          : calcWithoutDecimals(total_remaining - reserveAmountMu, Number(loanTokenMetadata.decimals ?? 1))

        const {
          transactionHistory,
          totalBorrowed,
          totalLended,
          lending24hVolume,
          borrowing24hVolume,
          marketCollateralChartData,
          marketLiquidityChartData,
        } = getTransactionHistory(history_data, dipDupData, feeds)
        const { myBorrowingList, permissinedBorrowingList, totalCollateral, vaultsBorrowedAmount } =
          await getBorrowings(vaults, dipDupData, feeds, interestRateDecimals, userAddres)
        const lendingItem = getLendingItem(
          loanToken,
          userMTokens,
          loanTokenMetadata.decimals,
          interestRateDecimals,
          userAddres,
        )

        const loanTokenUserBalance = await getUserBalanceForLoanAsset(loan_token_address, loan_token_name, userAddres)
        const tokenCurrentInterestRate = calcWithoutDecimals(loanToken.current_interest_rate, interestRateDecimals)
        const lendAPY = calcLendingAPY(tokenCurrentInterestRate, interestTreasuryShare)
        const borrowAPR = tokenCurrentInterestRate * 100

        acc.push({
          loanTokenData: {
            ...loanTokenMetadata,
            tokenType: loan_token_contract_standard as TokenType,
            userBalance: loanTokenUserBalance,
          },
          myBorrowingList,
          permissionedBorrowingList: permissinedBorrowingList,
          lendingItem,
          transactionHistory,
          marketCollateralChartData,
          marketLiquidityChartData,
          utilisationRate: utilisation_rate / 10 ** interestRateDecimals,

          availableLiquidity,
          totalLended: totalLended,
          totalBorrowed: totalBorrowed,
          loanTokenTotalCollaterals: totalCollateral,
          loanTokenVaultsTotalBorrowed: vaultsBorrowedAmount,

          borrowers: aggregate?.count ?? 0,
          suppliers: appropriateMtokenData?.accounts.length ?? 0,
          lending24hVolume,
          borrowing24hVolume,

          totalFeesEarned:
            userMTokens?.reduce((acc, { rewards_earned, m_token: { loan_token_name: mTokenLoanTokenName } }) => {
              if (mTokenLoanTokenName === loan_token_name) {
                acc += rewards_earned / 10 ** interestRateDecimals / 10 ** loanTokenMetadata.decimals
              }

              return acc
            }, 0) ?? 0,
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
  userDataLoansHistoryGql,
  userVaultsDataGql,
  feeds,
}: {
  dipDupTokens: State['tokens']['dipDupTokens']
  feeds: State['dataFeeds']['feedsLedger']
  userDataLoansHistoryGql: Mavryk_User['lending_controller_history_data_sender']
  userVaultsDataGql: Mavryk_User['lending_controller_vaults']
}) => {
  const { userLendings, userBorrowing } = userDataLoansHistoryGql?.reduce<{
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
        timestamp,
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
      const convertedAmount = convertNumberForClient({ number: amount, grage: assetData.decimals })

      switch (type) {
        case 0:
        case 1:
          acc.userLendings.push({
            icon: assetData.icon,
            id,
            amount: convertedAmount,
            usdAmount: convertedAmount * assetData.rate,
            date: timestamp,
            annualPecentage: calcLendingAPY(
              calcWithoutDecimals(loan_token.current_interest_rate, interest_rate_decimals),
              calcWithoutDecimals(interest_treasury_share, decimals),
            ),
            symbol: assetData.symbol,
            operationHash: operation_hash,
          })
          break
        case 2:
        case 3:
          acc.userBorrowing.push({
            icon: assetData.icon,
            id,
            date: timestamp,
            amount: convertedAmount,
            usdAmount: convertedAmount * assetData.rate,
            annualPecentage: calcWithoutDecimals(loan_token.current_interest_rate, interest_rate_decimals) * 100,
            operationHash: operation_hash,
            symbol: assetData.symbol,
          })
          break
      }

      return acc
    },
    { userLendings: [], userBorrowing: [] },
  ) ?? { userLendings: [], userBorrowing: [] }

  const userVaultsData =
    userVaultsDataGql?.reduce<Record<string, { borrowedAmount: number; collateralAmount: number }>>(
      (acc, { collateral_balances, loan_token, loan_principal_total }) => {
        if (!loan_token) return acc
        const vaultAssetData = getAssetMetadata({
          tokenAddress: loan_token.loan_token_address,
          tokenName: loan_token.loan_token_name,
          dipDupTokens,
          feeds,
          oracleId: String(loan_token.oracle_id),
        })

        if (!vaultAssetData) return acc

        const collateralAmount = collateral_balances.reduce((acc, { balance, token }) => {
          if (!token) return acc
          const collateralAssetData = getAssetMetadata({
            tokenAddress: token.token_address,
            tokenName: token.token_name,
            dipDupTokens,
            feeds,
            oracleId: String(token.oracle_id),
          })

          if (!collateralAssetData) return acc

          acc +=
            convertNumberForClient({ number: balance, grage: collateralAssetData.decimals }) * collateralAssetData.rate
          return acc
        }, 0)

        acc[loan_token.loan_token_name] = {
          borrowedAmount:
            convertNumberForClient({ number: loan_principal_total, grage: vaultAssetData.decimals }) *
            vaultAssetData.rate,
          collateralAmount,
        }

        return acc
      },
      {},
    ) ?? {}

  return {
    userLendings,
    userBorrowing,
    userVaultsData,
  }
}

// fn to calculate fee of the vault
export const calculateAccruedInterest = (
  currentLoanOutstandingTotal: number,
  vaultBorrowIndex: number,
  tokenBorrowIndex: number,
) => {
  let newLoanOutstandingTotal = currentLoanOutstandingTotal
  const vBorrowIndex = vaultBorrowIndex
  const loanTokenBorrowIndex = tokenBorrowIndex

  if (currentLoanOutstandingTotal > 0) {
    if (vBorrowIndex > 0) {
      newLoanOutstandingTotal = Math.trunc((currentLoanOutstandingTotal * loanTokenBorrowIndex) / vBorrowIndex)
    }
  }

  return newLoanOutstandingTotal
}

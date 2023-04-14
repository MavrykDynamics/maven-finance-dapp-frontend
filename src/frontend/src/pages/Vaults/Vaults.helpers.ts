import { getAssetColor } from './../Treasury/helpers/treasury.utils'
import dayjs from 'dayjs'
import { VaultType, LendingControllerGQL } from 'utils/TypesAndInterfaces/Vaults'
import { Aggregator } from 'utils/generated/graphqlTypes'
import { State } from 'reducers'
import {
  checkVaultIsInGracePeriod,
  checkVaultIsAbleToMarkedForLiquidation,
  checkVaultLiquidatableStatus,
  checkIfVaultIsAtRisk,
  calculateVaultMaxLiquidationAmount,
  calculateLiquidationPrice,
} from './calcFunctionsForVault'
import { Lending_Controller_Vault } from 'utils/generated/graphqlTypes'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'
import { getOracleAggregatorLatestPrice } from './Vaults.actions'
import { statusSortPriority, vaultsStatuses } from './Vaults.consts'
import {
  calcCollateralRatio,
  calculateAccruedInterest,
  getAssetMetadata,
  isTezosAsset,
} from 'pages/Loans/Loans.helpers'
import { calcWithoutDecimals, calcWithoutMu } from 'utils/calcFunctions'
import { BLOCKS_PER_MINUTE, FIXED_POINT_ACCURACY } from 'utils/constants'
import { getUserBalanceForLoanAsset } from 'pages/Loans/LoansFethcers'
import { CollateralType, DepositorsFlagType } from 'utils/TypesAndInterfaces/Loans'
import { ANY_USER, WHITELIST_USERS, NONE_USER, getStatusByCollateralRatio } from 'pages/Loans/Loans.const'
import { TokenType } from 'utils/TypesAndInterfaces/General'

type VaultsStorageProps = {
  lendingController: LendingControllerGQL
  feeds: State['dataFeeds']['feedsLedger']
  accountPkh?: string
  dipDupTokens: State['tokens']['dipDupTokens']
  oracleLatestPrices: Record<string, number>
}

export const normalizeVaultsStorage = async (storage: VaultsStorageProps) => {
  const { lendingController, feeds, accountPkh, dipDupTokens, oracleLatestPrices } = storage
  if (!lendingController.vaults.length)
    return {
      permissinedVaultsIds: [],
      myVaultsIds: [],
      allVaultsIds: [],
      vaultsMapper: {},
    }

  const interestRateDecimals = lendingController?.interest_rate_decimals || 0

  const data = await lendingController.vaults.reduce<
    Promise<{
      permissinedVaultsIds: string[]
      myVaultsIds: string[]
      allVaultsIds: string[]
      vaultsMapper: Record<string, VaultType>
    }>
  >(
    async (promiseAcc, item) => {
      const acc = await promiseAcc

      if (!item.loan_token || !item.vault?.address) return acc

      const loanTokenMetadata = getAssetMetadata({
        tokenName: item.loan_token.loan_token_name,
        tokenAddress: item.loan_token.loan_token_address,
        dipDupTokens,
        feeds,
        oracleId: String(item.loan_token.oracle_id),
      })

      const vaultAsset = getAssetMetadata({
        tokenName: item.loan_token.loan_token_name,
        tokenAddress: item.loan_token.loan_token_address,
        dipDupTokens,
        feeds,
        oracleId: String(item.loan_token.oracle_id),
      })

      if (!loanTokenMetadata || !vaultAsset) return acc

      const vaultCollateral = item.collateral_balances?.reduce<{
        normalizedCollaterals: Array<CollateralType>
        totalRow: CollateralType
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

          acc.totalRow.amount += collateralBalance * collateralAsset.rate
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

      const currentInterestRate = calcWithoutDecimals(item.loan_token?.current_interest_rate ?? 0, interestRateDecimals)

      const vaultXtzDelegatedTo = await (
        await fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/accounts/${item.vault.address}`)
      ).json()

      const currentBlock = await (
        await fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/blocks/${dayjs().toISOString()}`)
      ).json()

      const normalizeCollateralTokens = item.collateral_balances.length
        ? item.collateral_balances.map((collateralToken) => {
            return {
              balance: collateralToken.balance,
              token: {
                oracleId: collateralToken.token?.oracle_id,
              },
            }
          })
        : []

      const userBalance = await getUserBalanceForLoanAsset(
        item.loan_token.loan_token_address,
        item.loan_token.loan_token_name,
        accountPkh,
      )

      const borrowedAmount = item.loan_principal_total / 10 ** vaultAsset.decimals

      // Calculating Fee of the vault
      const accruedInterest =
        borrowedAmount === 0
          ? 0
          : calculateAccruedInterest(item.loan_outstanding_total, item.borrow_index, item.loan_token.borrow_index) /
            FIXED_POINT_ACCURACY

      const collateralRatio = calcCollateralRatio(vaultCollateral.totalRow.amount, borrowedAmount, vaultAsset.rate)
      const collateralData = vaultCollateral.normalizedCollaterals.length
        ? [...vaultCollateral.normalizedCollaterals, vaultCollateral.totalRow]
        : []

      const liquidationMax =
        (calculateVaultMaxLiquidationAmount(item.loan_outstanding_total, lendingController.max_vault_liquidation_pct) /
          10 ** vaultAsset.decimals) *
        vaultAsset.rate
      const liquidationReward = lendingController.liquidation_fee_pct / 10 ** lendingController.decimals
      const adminLiquidateFee = lendingController.admin_liquidation_fee_pct
      const liquidationPrice = item.loan_token?.oracle_id
        ? calculateLiquidationPrice(
            item.loan_outstanding_total / 10 ** item.loan_decimals,
            item.loan_token.oracle_id,
            lendingController.liquidation_ratio,
            oracleLatestPrices,
          )
        : 0

      const depositors = (item.vault?.depositors.map(({ depositor_id }) => depositor_id).filter(Boolean) ??
        []) as Array<string>
      const deporsitorsFlag: DepositorsFlagType =
        item.vault.allowance === 0
          ? ANY_USER
          : item.vault.allowance === 1 && depositors.length !== 0
          ? WHITELIST_USERS
          : NONE_USER

      const gotStatusByCollateralRatio = getStatusByCollateralRatio(collateralRatio)

      // Need one source to get status like vaults or loans.
      // Because at the moment the data is different for the same items

      const status =
        gotStatusByCollateralRatio !== 'no status'
          ? gotStatusByCollateralRatio
          : item.loan_token?.oracle_id
          ? vaultStatusChecker({
              currentBlockLevel: currentBlock?.level ?? 0,
              liquidationEndLevel: item.liquidation_end_level,
              markedForLiquidationLevel: item.marked_for_liquidation_level,
              liquidationDelayInMinutes: lendingController.liquidation_delay_in_minutes,
              loanOutstandingTotal: item.loan_outstanding_total / 10 ** item.loan_decimals,
              loanTokenOracleAddress: item.loan_token.oracle_id,
              liquidationRatio: lendingController.liquidation_ratio,
              vaultCollateralTokens: normalizeCollateralTokens,
              collateralRatio: lendingController.collateral_ratio,
              oracleLatestPrices,
            })
          : 'no status'

      const creationTimestamp = item.vault.creation_timestamp ? String(item.vault.creation_timestamp) : undefined

      // Need one source to get levelOfEarly and levelOfLate like vaults or loans.
      // Because at the moment the data is different for the same items

      // let levelOfEarly = 0
      // let levelOfLate = 0

      // if (status === vaultsStatuses.GRACE_PERIOD && currentBlock?.level) {
      //   levelOfEarly = currentBlock?.level ?? 0
      //   levelOfLate =
      //     item.marked_for_liquidation_level + lendingController.liquidation_delay_in_minutes * BLOCKS_PER_MINUTE
      // } else if (status === vaultsStatuses.LIQUIDATABLE && currentBlock?.level && item.liquidation_end_level) {
      //   levelOfEarly = currentBlock?.level ?? 0
      //   levelOfLate = item.liquidation_end_level
      // }

      const isXTZ = isTezosAsset(item.loan_token.loan_token_name)

      const reservePercent = item.loan_token.reserve_ratio / 10000
      const reserveAmountMu = item.loan_token.token_pool_total * reservePercent
      const availableLiquidity = isXTZ
        ? calcWithoutMu(item.loan_token.total_remaining - reserveAmountMu)
        : calcWithoutDecimals(
            item.loan_token.total_remaining - reserveAmountMu,
            Number(loanTokenMetadata.decimals ?? 1),
          )

      const borrowCapacity = Math.min(
        vaultCollateral.totalRow.amount / 2 - borrowedAmount * vaultAsset.rate,
        availableLiquidity,
      )

      const normallizedVault = {
        borrowedAsset: {
          ...vaultAsset,
          tokenType: item.loan_token.loan_token_contract_standard as TokenType,
          userBalance,
        },
        name: item.vault.name,
        borrowCapacity,
        avaliableLiq: availableLiquidity,
        collateralBalance: vaultCollateral.totalRow.amount,
        collateralRatio,
        apr: currentInterestRate * 100,
        fee: accruedInterest,
        daoFee: (lendingController.minimum_loan_fee_pct ?? 0) / 100,
        collateralData,
        borrowedAmount,
        address: item.vault?.address,
        ownerId: item.owner_id || '',
        vaultId: item.internal_id,
        creationTimestamp,
        status,

        levelOfEarly: currentBlock?.level ?? 0,
        levelOfLate:
          item.marked_for_liquidation_level +
          Number(item.lending_controller?.liquidation_delay_in_minutes) * BLOCKS_PER_MINUTE,

        liquidationMax,
        liquidationReward,
        adminLiquidateFee,
        liquidationPrice,
        xtzDelegatedTo: vaultXtzDelegatedTo?.delegate?.address ?? null,
        operators: [],
        sMVKDelegatedTo: '',
        depositors,
        deporsitorsFlag,
      }

      acc.vaultsMapper[item.vault.address] = normallizedVault
      acc.allVaultsIds.push(item.vault.address)

      if (accountPkh === item.owner_id) {
        acc.myVaultsIds.push(item.vault.address)
      }

      if (depositors.find((depositorId) => depositorId === accountPkh) || deporsitorsFlag === ANY_USER) {
        acc.permissinedVaultsIds.push(item.vault.address)
      }

      return acc
    },
    Promise.resolve({
      permissinedVaultsIds: [],
      myVaultsIds: [],
      allVaultsIds: [],
      vaultsMapper: {},
    }),
  )

  return data
}

type OracleLatestProps = {
  aggregator: Aggregator[]
}

export const normalizeOracleLatestPrice = (storage: OracleLatestProps) => {
  const { aggregator = [] } = storage

  if (!aggregator.length) return 0

  const [item] = aggregator

  return symbolsAfterDecimalPoint(item.last_completed_data / 10 ** item.decimals)
}

export const getOracleLatestPrices = async (vaults: Lending_Controller_Vault[]) => {
  const uniqueOracleAddresses = new Set<string>()

  vaults.map((item) => {
    const loanTokenOracleAddress = item.loan_token?.oracle_id
    const collateralBalances = item.collateral_balances

    if (loanTokenOracleAddress) {
      uniqueOracleAddresses.add(loanTokenOracleAddress)
    }

    if (collateralBalances.length) {
      collateralBalances.map((collateral) => {
        if (collateral.token?.oracle_id) {
          uniqueOracleAddresses.add(collateral.token.oracle_id)
        }
      })
    }
  })

  const arrayUniqueOracleAddresses = [...uniqueOracleAddresses]
  const prices = await Promise.all(arrayUniqueOracleAddresses.map((item) => getOracleAggregatorLatestPrice(item)))

  const result: Record<string, number> = {}

  prices.map((item, index) => {
    if (typeof item === 'number') {
      result[arrayUniqueOracleAddresses[index]] = item
    }
  })

  return result
}

export const getVaultAssets = (vaultsMapper: Record<string, VaultType>) => {
  const list = Object.values(vaultsMapper)

  const collateralAssets = new Set<string>()
  const loanAssets = new Set<string>()

  list.map(({ borrowedAsset, collateralData }) => {
    const { symbol = '' } = borrowedAsset

    if (symbol) {
      loanAssets.add(symbol)
    }

    if (collateralData.length) {
      collateralData.slice(0, -1).map(({ symbol }) => {
        if (symbol) {
          collateralAssets.add(symbol)
        }
      })
    }
  })

  return {
    collateralAssets: [...collateralAssets],
    loanAssets: [...loanAssets],
  }
}

type SortByVaultCategoryProps = {
  vaultsMapper: Record<string, VaultType>
  vaultsIds: string[]
  status?: string
}

export const sortByVaultCategory = ({ vaultsMapper, vaultsIds, status }: SortByVaultCategoryProps) => {
  const dataToSort = vaultsIds ? [...vaultsIds] : []

  const updatedPriority = status ? { ...statusSortPriority, [status]: 0 } : statusSortPriority

  return dataToSort.sort((a, b) => {
    const firstItem = vaultsMapper[a].status
    const secondItem = vaultsMapper[b].status

    return updatedPriority[firstItem] - updatedPriority[secondItem]
  })
}

type VaultAssetBalances = {
  globalVaultTVL: number
  collateralRatio: number
  avgCollateralRatio: number
  assets: Record<
    string,
    {
      balance: number
      usdValue: number
      rate: number
      decimals: number
      name: string
      chartColor: string
      symbol: string
    }
  >
}

export const reduceVaultsAssets = (vaultIds: string[], vaultsMapper: Record<string, VaultType>) => {
  let vaultWithBalances = 0
  let totalBorrowedAmounts = 0
  let totalCollateralBalances = 0
  let colorIdx = 0

  const { assets, globalVaultTVL } = vaultIds.reduce<VaultAssetBalances>(
    (acc, vaultId) => {
      const { assets } = acc
      const { collateralData, borrowedAmount, collateralBalance } = vaultsMapper[vaultId]

      totalBorrowedAmounts += borrowedAmount
      totalCollateralBalances += collateralBalance

      if (borrowedAmount && collateralBalance) {
        vaultWithBalances++
      }

      if (collateralData.length !== 0) {
        collateralData.slice(0, -1).forEach((collateral) => {
          acc.globalVaultTVL += collateral.amount * collateral.rate

          if (collateral.symbol && assets[collateral.symbol]) {
            assets[collateral.symbol].balance += collateral.amount
            assets[collateral.symbol].usdValue += collateral.amount * collateral.rate
          } else if (collateral.symbol) {
            assets[collateral.symbol] = {
              balance: collateral.amount,
              usdValue: collateral.amount * collateral.rate,
              rate: collateral.rate,
              name: collateral.symbol,
              symbol: collateral.symbol,
              chartColor: getAssetColor(colorIdx),
              decimals: 0,
            }
            colorIdx++
          }
        })
      }

      return acc
    },
    {
      assets: {},
      globalVaultTVL: 0,
      collateralRatio: 0,
      avgCollateralRatio: 0,
    },
  )

  const collateralRatio = (totalCollateralBalances / totalBorrowedAmounts) * 100

  return {
    assetsBalances: Object.values(assets),
    globalVaultTVL,
    collateralRatio,
    avgCollateralRatio: collateralRatio / vaultWithBalances,
  }
}

type VaultStatusCheckerType = {
  currentBlockLevel: number
  liquidationEndLevel: number
  markedForLiquidationLevel: number
  liquidationDelayInMinutes: number
  loanOutstandingTotal: number
  loanTokenOracleAddress: string
  liquidationRatio: number
  vaultCollateralTokens: any[]
  collateralRatio: number
  oracleLatestPrices: Record<string, number>
}

const vaultStatusChecker = ({
  currentBlockLevel,
  liquidationEndLevel,
  markedForLiquidationLevel,
  liquidationDelayInMinutes,
  loanOutstandingTotal,
  loanTokenOracleAddress,
  liquidationRatio,
  vaultCollateralTokens,
  collateralRatio,
  oracleLatestPrices,
}: VaultStatusCheckerType) => {
  if (checkVaultIsInGracePeriod(currentBlockLevel, markedForLiquidationLevel, liquidationDelayInMinutes)) {
    return vaultsStatuses.GRACE_PERIOD
  } else if (
    checkVaultIsAbleToMarkedForLiquidation(
      loanOutstandingTotal,
      loanTokenOracleAddress,
      liquidationRatio,
      vaultCollateralTokens,
      currentBlockLevel,
      liquidationEndLevel,
      markedForLiquidationLevel,
      liquidationDelayInMinutes,
      oracleLatestPrices,
    )
  ) {
    return vaultsStatuses.MARK
  } else if (
    checkVaultLiquidatableStatus(
      loanOutstandingTotal,
      loanTokenOracleAddress,
      liquidationRatio,
      vaultCollateralTokens,
      currentBlockLevel,
      liquidationEndLevel,
      markedForLiquidationLevel,
      liquidationDelayInMinutes,
      oracleLatestPrices,
    )
  ) {
    return vaultsStatuses.LIQUIDATABLE
  } else if (
    checkIfVaultIsAtRisk(
      loanOutstandingTotal,
      loanTokenOracleAddress,
      liquidationRatio,
      collateralRatio,
      vaultCollateralTokens,
      oracleLatestPrices,
    )
  ) {
    return vaultsStatuses.AT_RISK
  }

  return vaultsStatuses.ACTIVE
}

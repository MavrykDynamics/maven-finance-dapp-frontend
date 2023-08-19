import dayjs from 'dayjs'

// helpers
import { statusSortPriority, vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { api } from 'utils/api/api'
import {
  getTimestampByLevelUrl,
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  TimestampByLevelResponceType,
} from 'utils/api/api-helpers/getTimestampByLevel'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getAssetColor } from 'providers/TreasuryProvider/helpers/treasury.utils'
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'

// types
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import {
  FullLoansVaultType,
  VaultAssetData,
  VaultType,
  VaultsContext,
  VaultsCtxState,
  VaultsSubsRecordType,
  NullableVaultsCtxState,
} from '../vaults.provider.types'

// consts
import { EMPTY_VAULTS_CONTEXT, VAULTS_DATA } from '../vaults.provider.consts'

// sort vaults by status
export const sortVaultsByStatus = async ({
  vaultsMapper,
  vaultsIds,
  tokensMetadata,
  tokensPrices,
}: {
  vaultsMapper: Record<string, VaultType>
  vaultsIds: string[]
  tokensMetadata: TokensContext['tokensMetadata']
  tokensPrices: TokensContext['tokensPrices']
}) => {
  try {
    const vaultsLiquidationTimestamps = await vaultsIds.reduce<Promise<Record<string, number | null>>>(
      async (promiseAcc, vaultAddress) => {
        const acc = await promiseAcc
        const { liquidationLvl } = vaultsMapper[vaultAddress]

        if (!liquidationLvl) {
          acc[vaultAddress] = null
          return acc
        }

        const { data: liquidationTimestamp } = await api<TimestampByLevelResponceType>(
          getTimestampByLevelUrl(liquidationLvl),
          { headers: getTimestampByLevelHeaders },
          getTimestampByLevelSchema,
        )

        acc[vaultAddress] = new Date(liquidationTimestamp).getTime()

        return acc
      },
      Promise.resolve({}),
    )

    return [...vaultsIds].sort((a, b) => {
      const vaultAToken = getTokenDataByAddress({
        tokensMetadata,
        tokensPrices,
        tokenAddress: vaultsMapper[a].borrowedTokenAddress,
      })
      const vaultBToken = getTokenDataByAddress({
        tokensMetadata,
        tokensPrices,
        tokenAddress: vaultsMapper[b].borrowedTokenAddress,
      })

      if (!vaultAToken || !vaultAToken.rate || !vaultBToken || !vaultBToken.rate) return 0

      const vaultABorrowedAmount =
        convertNumberForClient({ number: vaultsMapper[a].borrowedAmount, grade: vaultAToken.decimals }) *
        vaultAToken.rate
      const vaultBBorrowedAmount =
        convertNumberForClient({ number: vaultsMapper[b].borrowedAmount, grade: vaultBToken.decimals }) *
        vaultBToken.rate

      const vaultAStatus = getVaultStatus({
        collateralRatio: getVaultCollateralRatio(
          getVaultCollateralBalance(vaultsMapper[a].collateralData, tokensMetadata, tokensPrices),
          vaultABorrowedAmount,
        ),
        borrowedAmount: vaultABorrowedAmount,
        liquidationTimestamp: vaultsLiquidationTimestamps[a],
      })

      const vaultBStatus = getVaultStatus({
        collateralRatio: getVaultCollateralRatio(
          getVaultCollateralBalance(vaultsMapper[b].collateralData, tokensMetadata, tokensPrices),
          vaultBBorrowedAmount,
        ),
        borrowedAmount: vaultBBorrowedAmount,
        liquidationTimestamp: vaultsLiquidationTimestamps[b],
      })

      return statusSortPriority[vaultAStatus] - statusSortPriority[vaultBStatus]
    })
  } catch (e) {
    console.error('vaults sorting by status error')

    return vaultsIds
  }
}

/**
 *
 * @param collateralRatio collateral ratio of the vault
 * @param borrowedAmount how much borrowed from the vault
 * @param liquidationTimestamp when vault can be liquidated
 * @returns status of the vault one of vaultsStatuses
 */
export const getVaultStatus = ({
  collateralRatio,
  borrowedAmount,
  liquidationTimestamp,
}: {
  collateralRatio: number
  borrowedAmount: number
  liquidationTimestamp: number | null
}): FullLoansVaultType['status'] => {
  try {
    if (collateralRatio < 200 && collateralRatio > 150 && borrowedAmount > 0) return vaultsStatuses.AT_RISK
    if (collateralRatio <= 150 && borrowedAmount > 0 && !liquidationTimestamp) return vaultsStatuses.MARK

    if (
      collateralRatio <= 150 &&
      borrowedAmount > 0 &&
      liquidationTimestamp &&
      dayjs().unix() < dayjs(liquidationTimestamp).unix()
    )
      return vaultsStatuses.GRACE_PERIOD
    if (
      collateralRatio <= 150 &&
      borrowedAmount > 0 &&
      liquidationTimestamp &&
      dayjs().unix() >= dayjs(liquidationTimestamp).unix()
    )
      return vaultsStatuses.LIQUIDATABLE
  } catch (e) {
    return vaultsStatuses.ACTIVE
  }

  return vaultsStatuses.ACTIVE
}

/**
 *
 * @param availableLiquidity – pool tokens amount in USD
 * @param borrowedAmount – how much borrowed in the vault in USD
 * @param collateralBalance – collateral amount of the vault in USD
 * @returns how much user can borrow in USD in that vault
 */
export const getVaultBorrowCapacity = (availableLiquidity: number, borrowedAmount: number, collateralBalance: number) =>
  Math.max(0, Math.min(collateralBalance / 2 - borrowedAmount, Math.max(availableLiquidity, 0)))

/**
 *
 * @param collateralData – array of collaterals of the vault
 * @param tokensMetadata – metadata of all tokens
 * @param tokensPrices – list of token prices
 * @returns sum in USD of all collaterals in the vault
 */
export const getVaultCollateralBalance = (
  collateralData: VaultType['collateralData'],
  tokensMetadata: TokensContext['tokensMetadata'],
  tokensPrices: TokensContext['tokensPrices'],
) =>
  collateralData.reduce((acc, { amount, tokenAddress }) => {
    const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
    if (!token || !token.rate) return acc
    const { decimals: collateralDecimals, rate: collateralRate } = token

    return (acc += convertNumberForClient({ number: amount, grade: collateralDecimals }) * collateralRate)
  }, 0)

/**
 *
 * @param collateralAmount – USD amount of collaterals in the vault
 * @param borrowedAmount – USD amount of borrowed number for the vault
 * @returns collateral ratio for the vault
 *
 * collateral ratio – is the relation of the borrowed amount to collaterals amount:
 * if vault has borrowAmount 0, collateral ratio 0 if we don't have collaterals, or 250, if we have some
 */
export const getVaultCollateralRatio = (collateralAmount: number, borrowedAmount: number) => {
  // means we haven't borrowed anything
  if (collateralAmount === 0) return 0

  // means we haven't borrowed, but we have deposited
  if (borrowedAmount === 0) return 250

  const collateralRatio = (collateralAmount / borrowedAmount) * 100
  return getNumberInBounds(0, 250, Number(collateralRatio.toFixed(1)))
}

// TODO: add descr to liquidation utils while testing liquidation functionality and popup
/**
 * @param totalOutstanding – USD amount of borrowed amount and fee of the vault
 * @param liquidationRatio – ??? TODO: add description
 * @returns liquidation price in USD
 */
export const getVaultLiquidationPrice = (totalOutstanding: number, liquidationRatio: number) =>
  totalOutstanding * (liquidationRatio / 1000)

/**
 * @param loanOutstandingTotal – USD amount of borrowed amount and fee of the vault
 * @param maxVaultLiquidationPercent – ??? TODO: add description
 * @returns ???
 */
export const calculateVaultMaxLiquidationAmount = (loanOutstandingTotal: number, maxVaultLiquidationPercent: number) =>
  Math.trunc((loanOutstandingTotal * maxVaultLiquidationPercent) / 10000)

/**
 * @param adminLiquidationFeePercent – ??? TODO: add description
 * @param liquidationAmount – ??? TODO: add description
 * @returns ???
 */
export const calculateAdminLiquidationFee = (adminLiquidationFeePercent: number, liquidationAmount: number) =>
  Math.trunc((adminLiquidationFeePercent * liquidationAmount) / 10000)

/**
 * @param collateralAmount – amount of 1 of the collateral tokens in USD
 * @param totalAmount – total collateralAmount in USD
 * @returns % of 1 token from all tokens
 */
export const calculateCollateralShare = (collateralAmount: number, totalAmount: number) => {
  if (totalAmount === 0) return 100
  return getNumberInBounds(0, 100, Number(((collateralAmount / totalAmount) * 100).toFixed(2)))
}

// Vaults dashboard calcs

/**
 * Used on dashboard overview vautls tab
 * @param vaultIds array of vaults addresses
 * @param vaultsMapper dictionary <vaultAddress, vault data>
 * @param tokensMetadata dictionary <tokenAddress, token metadata>
 * @param tokensPrices dictionary <tokenSymbol, token rate>
 * @returns global TVL for vault, general collateral ratio, average collateral ratio, and list of collareral tokens that consist from balance, represent color and its address
 */
export const reduceVaultsAssets = (
  vaultIds: string[],
  vaultsMapper: Record<string, VaultType>,
  tokensMetadata: TokensContext['tokensMetadata'],
  tokensPrices: TokensContext['tokensPrices'],
) => {
  let vaultWithBalances = 0
  let totalBorrowedAmounts = 0
  let totalCollateralBalances = 0
  let colorIdx = 0

  const { assets, globalVaultTVL } = vaultIds.reduce<{
    globalVaultTVL: number
    collateralRatio: number
    avgCollateralRatio: number
    assets: Record<string, VaultAssetData>
  }>(
    (acc, vaultId) => {
      const { assets } = acc
      const { collateralData, borrowedAmount, borrowedTokenAddress } = vaultsMapper[vaultId]

      const token = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata, tokensPrices })
      if (!token || !token.rate) return acc
      const { decimals: borrowedTokenDecimals, rate: borrowedTokenRate } = token

      const collateralBalance = getVaultCollateralBalance(collateralData, tokensMetadata, tokensPrices)

      totalBorrowedAmounts +=
        convertNumberForClient({ number: borrowedAmount, grade: borrowedTokenDecimals }) * borrowedTokenRate
      totalCollateralBalances += collateralBalance

      if (borrowedAmount && collateralBalance) {
        vaultWithBalances++
      }

      collateralData.forEach(({ amount, tokenAddress }) => {
        const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
        if (!token || !token.rate) return
        const { decimals: collateralDecimals, rate: collateralRate } = token

        const convertedAmount = convertNumberForClient({ number: amount, grade: collateralDecimals })

        acc.globalVaultTVL += convertedAmount * collateralRate

        if (assets[tokenAddress]) {
          assets[tokenAddress].balance += amount
        } else {
          assets[tokenAddress] = {
            balance: amount,
            chartColor: getAssetColor(colorIdx),
            tokenAddress,
          }
          colorIdx++
        }
      })

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

export const getVaultsProviderReturnValue = ({
  vaultsCtxState,
  activeSubs,
  changeVaultsSubscriptionsList,
  userAddress,
}: {
  vaultsCtxState: NullableVaultsCtxState
  activeSubs: VaultsSubsRecordType
  changeVaultsSubscriptionsList: VaultsContext['changeVaultsSubscriptionsList']
  userAddress: string | null
}) => {
  const { vaultsMapper, myVaultsIds, allVaultsIds, permissionedVaultsIds } = vaultsCtxState
  const commonToReturn = {
    changeVaultsSubscriptionsList,
  }

  /**
   * isLoading indicates whethet provider is loading smth, so we need to show loader, not load in background, cases:
   * 1. if provider subscriptions don't used and don't have any data loaded
   * 2. if we subscribed to all vaults and allVaultsIds list is empty
   * 3. if we subscribed to vaults where user is depositor and permissionedVaultsIds list is empty
   * 4. if we subscribed to vaults where user is owner and myVaultsIds list is empty
   */
  const isLoading =
    (!activeSubs[VAULTS_DATA] && vaultsMapper === null) ||
    (activeSubs[VAULTS_DATA] === 'allVaults' && allVaultsIds === null) ||
    (userAddress && activeSubs[VAULTS_DATA] === 'userIsDepositor' && permissionedVaultsIds === null) ||
    (userAddress && activeSubs[VAULTS_DATA] === 'userIsOwner' && myVaultsIds === null)

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_VAULTS_CONTEXT,
      isLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<VaultsCtxState>(vaultsCtxState, EMPTY_VAULTS_CONTEXT)
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}

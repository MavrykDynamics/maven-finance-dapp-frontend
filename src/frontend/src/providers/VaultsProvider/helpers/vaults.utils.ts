import dayjs from 'dayjs'

// helpers
import {statusSortPriority, vaultsStatuses} from 'pages/Vaults/Vaults.consts'
import {api} from 'utils/api/api'
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
  TimestampByLevelResponceType,
} from 'utils/api/api-helpers/getTimestampByLevel'
import {getTokenDataByAddress} from 'providers/TokensProvider/helpers/tokens.utils'
import {replaceNullValuesWithDefault} from 'providers/common/utils/repalceNullValuesWithDefault'
import {convertNumberForClient, getNumberInBounds} from 'utils/calcFunctions'

// types
import {TokensContext} from 'providers/TokensProvider/tokens.provider.types'
import {
  FullLoansVaultType,
  NullableVaultsCtxState,
  VaultsContext,
  VaultsCtxState,
  VaultsSubsRecordType,
  VaultType,
} from '../vaults.provider.types'

// consts
import {EMPTY_VAULTS_CONTEXT, VAULTS_DATA} from '../vaults.provider.consts'
import {MINIMUN_COLLATERAL_RATIO_PERSENT} from './vaults.const'

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

      const vaultATotalOutstanding =
        convertNumberForClient({
          number: vaultsMapper[a].borrowedAmount + vaultsMapper[a].fee,
          grade: vaultAToken.decimals,
        }) * vaultAToken.rate
      const vaultBTotalOutstanding =
        convertNumberForClient({
          number: vaultsMapper[b].borrowedAmount + vaultsMapper[b].fee,
          grade: vaultBToken.decimals,
        }) * vaultBToken.rate

      const vaultAStatus = getVaultStatus({
        collateralRatio: getVaultCollateralRatio(
          getVaultCollateralBalance(vaultsMapper[a].collateralData, tokensMetadata, tokensPrices),
          vaultATotalOutstanding,
        ),
        totalOustanding: vaultATotalOutstanding,
        liquidationTimestamp: vaultsLiquidationTimestamps[a],
      })

      const vaultBStatus = getVaultStatus({
        collateralRatio: getVaultCollateralRatio(
          getVaultCollateralBalance(vaultsMapper[b].collateralData, tokensMetadata, tokensPrices),
          vaultBTotalOutstanding,
        ),
        totalOustanding: vaultBTotalOutstanding,
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
 * @param totalOustanding USD amount of principal + interest in the vault
 * @param liquidationTimestamp when vault can be liquidated
 * @returns status of the vault one of vaultsStatuses
 */
export const getVaultStatus = ({
  collateralRatio,
  totalOustanding,
  liquidationTimestamp,
}: {
  collateralRatio: number
  totalOustanding: number
  liquidationTimestamp: number | null
}): FullLoansVaultType['status'] => {
  try {
    if (collateralRatio < MINIMUN_COLLATERAL_RATIO_PERSENT && collateralRatio > 150 && totalOustanding > 0)
      return vaultsStatuses.AT_RISK
    if (collateralRatio <= 150 && totalOustanding > 0 && !liquidationTimestamp) return vaultsStatuses.MARK

    if (
      collateralRatio <= 150 &&
      totalOustanding > 0 &&
      liquidationTimestamp &&
      dayjs().valueOf() < dayjs(liquidationTimestamp).valueOf()
    )
      return vaultsStatuses.GRACE_PERIOD
    if (
      collateralRatio <= 150 &&
      totalOustanding > 0 &&
      liquidationTimestamp &&
      dayjs().valueOf() >= dayjs(liquidationTimestamp).valueOf()
    )
      return vaultsStatuses.LIQUIDATABLE
  } catch (e) {
    return vaultsStatuses.ACTIVE
  }

  return vaultsStatuses.ACTIVE
}

/**
 *
 * @param availableLiquidity – USD amount of market pool tokens
 * @param totalOustanding – USD amount of principal + interest in the vault
 * @param collateralBalance – USD amount of collaterals in the vault
 * @returns how much user can borrow in USD for that vault
 */
export const getVaultBorrowCapacity = (
  availableLiquidity: number,
  totalOustanding: number,
  collateralBalance: number,
  // TODO: pay attention to this 2.0001, and discuss it with Sam
) => Math.max(0, Math.min(collateralBalance / 2.0001 - totalOustanding, Math.max(availableLiquidity, 0)))

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
 * @param totalOutstanding
 * @param useMinMax
 * @returns collateral ratio for the vault
 *
 * collateral ratio – is the relation of the borrowed amount to collaterals amount:
 * if vault has borrowAmount 0, collateral ratio 0 if we don't have collaterals, or 250, if we have some
 * The upper bound for the collateral ratio is 1,000. This allows people to see that their vault is significantly over collateralized
 */
export const getVaultCollateralRatio = (collateralAmount: number, totalOutstanding: number, useMinMax = true) => {
  // means we haven't borrowed anything
  if (collateralAmount === 0) return 0

  // means we haven't borrowed, but we have deposited
  if (totalOutstanding === 0) return 250

  const collateralRatio = (collateralAmount / totalOutstanding) * 100
  return useMinMax ? getNumberInBounds(0, 1000, Number(collateralRatio.toFixed(1))) : Number(collateralRatio.toFixed(1))
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

export const getVaultsProviderReturnValue = ({
  vaultsCtxState,
  activeSubs,
  changeVaultsSubscriptionsList,
  setVaultsDashboardData,
  userAddress,
}: {
  vaultsCtxState: NullableVaultsCtxState
  activeSubs: VaultsSubsRecordType
  changeVaultsSubscriptionsList: VaultsContext['changeVaultsSubscriptionsList']
  setVaultsDashboardData: VaultsContext['setVaultsDashboardData']
  userAddress: string | null
}) => {
  const { vaultsMapper, myVaultsIds, allVaultsIds, permissionedVaultsIds, vaultsDashboardData } = vaultsCtxState
  const commonToReturn = {
    changeVaultsSubscriptionsList,
    setVaultsDashboardData,
    vaultsDashboardData,
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
      ...EMPTY_VAULTS_CONTEXT,
      ...commonToReturn,
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

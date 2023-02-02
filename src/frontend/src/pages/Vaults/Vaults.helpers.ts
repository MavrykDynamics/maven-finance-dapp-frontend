import dayjs from 'dayjs'
import { VaultType, CollateralType, LendingControllerGQL } from 'utils/TypesAndInterfaces/Vaults'
import { Aggregator } from 'utils/generated/graphqlTypes'
import { State } from 'reducers'
import {
  checkVaultIsInGracePeriod,
  checkVaultIsAbleToMarkedForLiquidation,
  checkVaultLiquidatableStatus,
  checkIfVaultIsAtRisk,
  calculateVaultMaxLiquidationAmount,
} from './calcFunctionsForVaultStatuses'
import { Lending_Controller_Vault } from 'utils/generated/graphqlTypes'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'
import { getOracleAggregatorLatestPrice } from './Vaults.actions'
import { statusSortPriority, vaultsStatuses } from './Vaults.consts'
import { fetchRateBySymbols } from 'reducers/actions/dipDupActions.actions'
import { calcCollateralRatio, calculateCompoundedInterest, getAssetMetadata } from 'pages/Loans/Loans.helpers'
import { calcWithoutDecimals } from 'utils/calcFunctions'
import { BLOCKS_PER_MINUTE } from 'utils/constants'
import { getUserBalanceForLoanAsset } from 'pages/Loans/LoansFethcers'

type VaultsStorageProps = {
  lendingController: LendingControllerGQL
  feeds: State['oracles']['oraclesStorage']['feeds']
  accountPkh?: string
  dipDupTokens: State['tokens']['dipDupTokens']
  currentBlockLevel?: number
  oracleLatestPrices: Record<string, number>
}

export const normalizeVaultsStorage = async (storage: VaultsStorageProps) => {
  const { lendingController, feeds, accountPkh, dipDupTokens, currentBlockLevel, oracleLatestPrices } = storage
  if (!lendingController.vaults.length)
    return {
      myVaultsIds: [],
      allVaultsIds: [],
      vaultsMapper: {},
    }

  const interestRateDecimals = lendingController?.interest_rate_decimals || 0

  const data = await lendingController.vaults.reduce<
    Promise<{
      myVaultsIds: string[]
      allVaultsIds: string[]
      vaultsMapper: Record<string, VaultType>
    }>
  >(
    async (promiseAcc, item) => {
      const acc = await promiseAcc
      if (!item.loan_token || !item.vault?.address) return acc

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
            assetSymbol: collateralAsset.symbol,
            assetIcon: collateralAsset.icon,
            balance: collateralBalance,
            assetRate: collateralAsset.rate,
            maxWithdraw: 0,
            collateralShare: 0,
          })

          acc.totalRow.balance += collateralBalance * collateralAsset.rate
          // TODO: add a valid result in the field below
          acc.totalRow.maxWithdraw += 0

          return acc
        },
        {
          normalizedCollaterals: [],
          totalRow: {
            assetSymbol: 'total',
            balance: 0,
            assetRate: 0,
            maxWithdraw: 0,
            collateralShare: 100,
          },
        },
      ) ?? {
        normalizedCollaterals: [],
        totalRow: {
          assetSymbol: 'total',
          balance: 0,
          assetRate: 0,
          maxWithdraw: 0,
          collateralShare: 100,
        },
      }

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

      const status =
        currentBlockLevel && lendingController?.liquidation_delay_in_minutes && item.loan_token?.oracle_id
          ? vaultStatusChecker({
              currentBlockLevel,
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

      let levelOfEarly = 0
      let levelOfLate = 0

      if (status === vaultsStatuses.GRACE_PERIOD && currentBlockLevel) {
        levelOfEarly = currentBlockLevel
        levelOfLate =
          item.marked_for_liquidation_level + lendingController.liquidation_delay_in_minutes * BLOCKS_PER_MINUTE
      } else if (status === vaultsStatuses.LIQUIDATABLE && currentBlockLevel && item.liquidation_end_level) {
        levelOfEarly = currentBlockLevel
        levelOfLate = item.liquidation_end_level
      }

      const currentInterestRate = calcWithoutDecimals(item.loan_token?.current_interest_rate ?? 0, interestRateDecimals)

      const vaultXtzDelegatedTo = await (
        await fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/accounts/${item.vault.address}`)
      ).json()

      const currentBlock = await (
        await fetch(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/blocks/${dayjs().toISOString()}`)
      ).json()

      const userBalance = await getUserBalanceForLoanAsset(
        item.loan_token.loan_token_address,
        item.loan_token.loan_token_name,
        accountPkh,
      )

      const fee =
        calculateCompoundedInterest(currentInterestRate, item.last_updated_block_level, currentBlock?.level ?? 0) /
        10 ** interestRateDecimals

      const vaultAsset = getAssetMetadata({
        tokenName: item.loan_token.loan_token_name,
        tokenAddress: item.loan_token.loan_token_address,
        dipDupTokens,
        feeds,
        oracleId: String(item.loan_token.oracle_id),
      })

      if (!vaultAsset) return acc

      const borrowedAmount = item.loan_outstanding_total / 10 ** vaultAsset.decimals

      const collateralUtilization = calcCollateralRatio(
        vaultCollateral.totalRow.balance,
        borrowedAmount,
        vaultAsset.rate,
      )

      const liquidationMax = calculateVaultMaxLiquidationAmount(
        item.loan_outstanding_total,
        lendingController.max_vault_liquidation_pct,
      )
      const liquidationReward = lendingController.liquidation_fee_pct / 10 ** lendingController.decimals
      const adminLiquidateFee = lendingController.admin_liquidation_fee_pct

      const normallizedVault = {
        borrowedAsset: {
          assetSymbol: vaultAsset.symbol,
          assetName: vaultAsset.name,
          assetIcon: vaultAsset.icon,
          amtBorrowed: borrowedAmount,
          assetRate: vaultAsset.rate,
          userBalance,
          collateralBalance: vaultCollateral.totalRow.balance,
          collateralUtilization,
          apr: currentInterestRate * 100,
          fee,
        },

        collateralData: vaultCollateral.normalizedCollaterals.concat(
          vaultCollateral.normalizedCollaterals.length > 1 ? [vaultCollateral.totalRow] : [],
        ),
        xtzDelegatedTo: vaultXtzDelegatedTo?.delegate?.address ?? null,
        operators: [],
        sMVKDelegatedTo: '',
        address: item.vault?.address,
        ownerId: item.owner_id || '',
        vaultId: item.internal_id,
        creationTimestamp,
        status,
        levelOfEarly,
        levelOfLate,
        liquidationMax,
        liquidationReward,
        adminLiquidateFee,
        depositors: item.vault?.depositors.map(({ depositor_id }) => depositor_id) as Array<string> | undefined,
      }

      acc.vaultsMapper[item.vault.address] = normallizedVault
      acc.allVaultsIds.push(item.vault.address)

      if (accountPkh === item.owner_id) {
        acc.myVaultsIds.push(item.vault.address)
      }

      return acc
    },
    Promise.resolve({
      myVaultsIds: [],
      allVaultsIds: [],
      vaultsMapper: {},
    }),
  )

  // sort data by statuses
  const dataWithSortedIds = {
    myVaultsIds: sortByVaultCategory({
      vaultsIds: data.myVaultsIds,
      vaultsMapper: data.vaultsMapper,
    }),
    allVaultsIds: sortByVaultCategory({
      vaultsIds: data.allVaultsIds,
      vaultsMapper: data.vaultsMapper,
    }),
    vaultsMapper: data.vaultsMapper,
  }

  return dataWithSortedIds
}

export const getVaultsTokensRates = async (
  vaults: LendingControllerGQL['vaults'],
  dipDupTokens: State['tokens']['dipDupTokens'],
  tokenRatesFromRedux: State['tokens']['tokensPrices'],
) => {
  try {
    const loanTokenSymbols = Array.from(
      vaults?.reduce((acc, { loan_token, collateral_balances }) => {
        const { loan_token_name = '', loan_token_address = '' } = loan_token ?? {}

        // Getting symbol metadata of loanToken
        const tokenInfo = dipDupTokens?.find(({ contract }) => contract === loan_token_address)
        let tokenSymbolToFetch = null
        if (loan_token_name === 'tez') {
          tokenSymbolToFetch = 'tezos'
        } else {
          tokenSymbolToFetch = tokenInfo?.metadata.symbol ?? loan_token_name
        }

        if (!tokenRatesFromRedux[tokenSymbolToFetch]) {
          acc.add(tokenSymbolToFetch)
        }

        // mapping through vaults to get symbol of each collateral asset
        collateral_balances.forEach(({ token }) => {
          const collaretalTokenInfo = dipDupTokens?.find(({ contract }) => contract === token?.token_address)

          if (collaretalTokenInfo && !tokenRatesFromRedux[collaretalTokenInfo.metadata.symbol]) {
            acc.add(collaretalTokenInfo.metadata.symbol)
          }
        })

        return acc
      }, new Set<string>()) ?? new Set(),
    )

    return await fetchRateBySymbols(loanTokenSymbols)
  } catch (e) {
    console.log('getVaultsTokensRates error: ', e)
    return {}
  }
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
    const { assetSymbol = '' } = borrowedAsset

    if (assetSymbol) {
      loanAssets.add(assetSymbol)
    }

    if (collateralData.length) {
      collateralData.map(({ assetSymbol }) => {
        if (assetSymbol) {
          collateralAssets.add(assetSymbol)
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
      symbol: string
    }
  >
}

export const reduceVaultsAssets = (vaultIds: string[], vaultsMapper: Record<string, VaultType>) => {
  let notEmptyCollateral = 0

  const { assets, globalVaultTVL, collateralRatio } = vaultIds.reduce<VaultAssetBalances>(
    (acc, vaultId) => {
      const { assets } = acc
      const { collateralData, borrowedAsset } = vaultsMapper[vaultId]

      if (collateralData.length !== 0) {
        notEmptyCollateral++
        acc.collateralRatio += borrowedAsset.collateralUtilization

        collateralData.slice(0, -1).forEach((collateral) => {
          acc.globalVaultTVL += collateral.balance * collateral.assetRate

          if (collateral.assetSymbol && assets[collateral.assetSymbol]) {
            assets[collateral.assetSymbol].balance += collateral.balance
            assets[collateral.assetSymbol].usdValue += collateral.balance * collateral.assetRate
          } else if (collateral.assetSymbol) {
            assets[collateral.assetSymbol] = {
              balance: collateral.balance,
              usdValue: collateral.balance * collateral.assetRate,
              rate: collateral.assetRate,
              name: collateral.assetSymbol,
              symbol: collateral.assetSymbol,
              decimals: 0,
            }
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

  return {
    assetsBalances: Object.values(assets),
    globalVaultTVL,
    collateralRatio,
    avgCollateralRatio: collateralRatio / notEmptyCollateral,
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

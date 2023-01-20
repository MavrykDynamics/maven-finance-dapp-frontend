import { LendingControllerVaultGQL, VaultType, CollateralType, LendingControllerGQL } from 'utils/TypesAndInterfaces/Vaults'
import { State } from 'reducers'
import {
  checkVaultIsInGracePeriod,
  checkVaultIsAbleToMarkedForLiquidation,
  checkVaultLiquidatableStatus,
  checkIfVaultIsAtRisk,
} from './calcFunctionsForVaultStatuses'
import { Lending_Controller_Vault } from 'utils/generated/graphqlTypes'
import { getOracleAggregatorLatestPrice } from 'pages/Satellites/Satellites.actions'

type VaultsStorageProps = {
  lendingController: LendingControllerGQL
  vaultsTokensRate: Record<string, number>
  accountPkh?: string
  dipDupTokens: State['tokens']['dipDupTokens']
  currentBlockLevel?: number
  oracleLatestPrices: Record<string, number>
}

export const normalizeVaultsStorage = (storage: VaultsStorageProps) => {
  const {
    lendingController,
    vaultsTokensRate,
    accountPkh,
    dipDupTokens,
    currentBlockLevel,
    oracleLatestPrices,
  } = storage
  if (!lendingController.vaults.length) return {
    myVaultsIds: [],
    allVaultsIds: [],
    vaultsMapper: {},
  }
  
  const data = lendingController.vaults.reduce<{
    myVaultsIds: string[], allVaultsIds: string[], vaultsMapper: Record<string, VaultType> 
  }>((acc, item) => {

    const asset = dipDupTokens.find(({ contract }) => contract === item.loan_token?.lp_token_address)

    const vaultCollateral = item.collateral_balances?.reduce<{
      normalizedCollaterals: Array<CollateralType>
      totalRow: CollateralType
    }>(
      (acc, collateral) => {
        // TODO: add handling for xtz asset
        const asset = dipDupTokens.find(({ contract }) => contract === collateral.token?.token_address) ?? {
          metadata: {
            symbol: 'tez',
            icon: '/images/tezos.png',
          },
        }
        
        acc.normalizedCollaterals.push({
          assetSymbol: asset?.metadata.symbol,
          assetIcon: asset?.metadata.icon,
          balance: collateral.balance,
          ...(asset?.metadata.symbol ? { assetRate: vaultsTokensRate[asset.metadata.symbol] } : { assetRate: null }),
          maxWithdraw: 0,
          collateralShare: 0
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
          collateralShare: 100
        },
      },
    ) ?? {
      normalizedCollaterals: [],
      totalRow: {
        assetSymbol: 'total',
        balance: 0,
        assetRate: null,
        maxWithdraw: 0,
        collateralShare: 100
      },
    }
    
    if (item.vault?.address) {
      const normalizeCollateralTokens = item.collateral_balances.length ? item.collateral_balances.map((collateralToken) => {
        return {
          balance: collateralToken.balance,
          token: {
            oracleId: collateralToken.token?.oracle_id
          }
        }
      }) : []

      const status = (
        currentBlockLevel && 
        lendingController?.liquidation_delay_in_minutes && 
        item.loan_token?.oracle_id
      ) ? vaultStatusChecker({
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
      }) : 'no status'

      const normallizedVault = {
        borrowedAsset: {
          assetSymbol: asset?.metadata.symbol ?? item.loan_token?.loan_token_name,
          ...(asset?.metadata.name ? { assetName: asset?.metadata.name } : {}),
          assetIcon: asset?.metadata.icon,
          amtBorrowed: 0,
          ...(asset?.metadata.symbol
            ? { assetRate: vaultsTokensRate[item.loan_token?.loan_token_name === 'tez' ? 'tez' : asset.metadata.symbol] }
            : { assetRate: null }),
          collateralBalance: vaultCollateral.totalRow?.balance ?? 0,
          collateralUtilization: 0,
          apr: 0,
          fee: 0,
        },
        collateralData: vaultCollateral.normalizedCollaterals.concat(
          vaultCollateral.normalizedCollaterals.length > 1 ? [vaultCollateral.totalRow] : [],
        ),
        borrowedAmount: item.loan_outstanding_total,
        xtzDelegatedTo: '',
        operators: [],
        sMVKDelegatedTo: '',
        address: item.vault?.address,
        ownerId: item.owner_id || '',
        vaultId: item.internal_id,
        status,
        currentBlockLevel,
        liquidationEndLevel: item.liquidation_end_level,
        markedForLiquidationLevel: item.marked_for_liquidation_level,
        liquidationDelayInMinutes: lendingController.liquidation_delay_in_minutes,
        depositors: item.vault?.depositors.map(({ depositor_id }) => depositor_id) as Array<string> | undefined,
      }

      acc.vaultsMapper[item.vault.address] = normallizedVault
      acc.allVaultsIds.push(item.vault.address)

      if (accountPkh === item.owner_id) {
        acc.myVaultsIds.push(item.vault.address)
      }
    }

    return acc
  }, {
    myVaultsIds: [],
    allVaultsIds: [],
    vaultsMapper: {},
  })

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
    vaultsMapper: data.vaultsMapper
  }

  return dataWithSortedIds
}

export const getVaultTokensSymbols = ({
  vaults,
  dipDupTokens,
}: {
  vaults?: Array<LendingControllerVaultGQL>
  dipDupTokens: State['tokens']['dipDupTokens']
}) => {
  if (!vaults?.length) return []
  
  return Array.from(
    vaults?.reduce((acc, { collateral_balances }) => {
      // mapping througt vaults to get symbol of each collateral asset
      collateral_balances?.forEach(({ token }) => {
        const collaretalTokenInfo = dipDupTokens?.find(({ contract }) => contract === token?.token_address) ?? {
          metadata: {
            symbol: 'tezos',
          },
        }

        if (collaretalTokenInfo) {
          acc.add(collaretalTokenInfo.metadata.symbol)
        }
      })
      return acc
    }, new Set<string>()) ?? new Set(),
  )
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
  if (checkVaultIsInGracePeriod(
    currentBlockLevel,
    markedForLiquidationLevel,
    liquidationDelayInMinutes,
  )){
    return vaultsStatuses.GRACE_PERIOD
  } else if (checkVaultIsAbleToMarkedForLiquidation(
    loanOutstandingTotal,
    loanTokenOracleAddress,
    liquidationRatio,
    vaultCollateralTokens,
    currentBlockLevel,
    liquidationEndLevel,
    markedForLiquidationLevel,
    liquidationDelayInMinutes,
    oracleLatestPrices,
  )){
    return vaultsStatuses.MARK
  } else if (checkVaultLiquidatableStatus(
    loanOutstandingTotal,
    loanTokenOracleAddress,
    liquidationRatio,
    vaultCollateralTokens,
    currentBlockLevel,
    liquidationEndLevel,
    markedForLiquidationLevel,
    liquidationDelayInMinutes,
    oracleLatestPrices,
  )){
    return vaultsStatuses.LIQUIDATABLE
  } else if (checkIfVaultIsAtRisk(
    loanOutstandingTotal,
    loanTokenOracleAddress,
    liquidationRatio,
    collateralRatio,
    vaultCollateralTokens,
    oracleLatestPrices,
  )){
    return vaultsStatuses.AT_RISK
  }

  return vaultsStatuses.ACTIVE
}

export const getOracleLatestPrices = async (vaults: Lending_Controller_Vault[]) => {
    const uniqueOracleAddresses= new Set<string> ()

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
    
    if (assetSymbol){
      loanAssets.add(assetSymbol)
    }

    if (collateralData.length){
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

export const vaultsStatuses = {
  LIQUIDATABLE: 'LIQUIDATABLE',
  GRACE_PERIOD: 'GRACE PERIOD',
  MARK: 'MARK',
  AT_RISK: 'AT RISK',
  ACTIVE: 'ACTIVE',
}

const priority = {
  [vaultsStatuses.LIQUIDATABLE]: 1,
  [vaultsStatuses.GRACE_PERIOD]: 2,
  [vaultsStatuses.MARK]: 3,
  [vaultsStatuses.AT_RISK]: 4,
  [vaultsStatuses.ACTIVE]: 5,
};

type SortByVaultCategoryProps = {
  vaultsMapper: Record<string, VaultType>
  vaultsIds: string[]
  status?: string
}

export const sortByVaultCategory = ({vaultsMapper, vaultsIds, status}: SortByVaultCategoryProps) => {
  const dataToSort = vaultsIds ? [...vaultsIds] : []

  const updatedPriority = status 
    ? { ...priority, [status]: 0 }
    : priority

  return dataToSort.sort((a, b) => {
    const firstItem = vaultsMapper[a].status
    const secondItem = vaultsMapper[b].status

    return updatedPriority[firstItem] - updatedPriority[secondItem]
  });
}

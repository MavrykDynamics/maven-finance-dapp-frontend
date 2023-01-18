import { LendingControllerVaultGQL, VaultType, CollateralType, LendingControllerGQL } from 'utils/TypesAndInterfaces/Vaults'
import { State } from 'reducers'
import {
  checkVaultIsInGracePeriod,
  checkVaultIsAbleToMarkedForLiquidation,
  checkVaultLiquidatableStatus,
} from './calcFunctionsForVaultStatuses'
import { VaultsStatuses } from './Vaults.view'

type VaultsStorageProps = {
  lendingController: LendingControllerGQL
  vaults: Array<LendingControllerVaultGQL>
  vaultsTokensRate: Record<string, number>
  accountPkh?: string
  dipDupTokens: State['tokens']['dipDupTokens']
  currentBlockLevel?: number
  liquidationDelayInMinutes?: number
  oracleLatestPrice: number
}

export const normalizeVaultsStorage = (storage: VaultsStorageProps) => {
  const {
    lendingController,
    vaults = [],
    vaultsTokensRate,
    accountPkh,
    dipDupTokens,
    currentBlockLevel,
    liquidationDelayInMinutes,
    oracleLatestPrice,
  } = storage

  if (!vaults.length) return []
  
  return vaults.reduce<{
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

      const normalizeCollateralTokens = lendingController.collateral_tokens.map((collateralToken) => {
        return collateralToken.balances.length ? { ...collateralToken.balances[0] } : {}
      })

    
      const status = currentBlockLevel && liquidationDelayInMinutes ? vaultStatusChecker({
        currentBlockLevel,
        liquidationEndLevel: item.liquidation_end_level,
        markedForLiquidationLevel: item.marked_for_liquidation_level,
        liquidationDelayInMinutes,
        loanOutstandingTotal: item.loan_outstanding_total / 10 ** item.loan_decimals,
        loanTokenOracleAddress: item.loan_token?.oracle_id || '',
        liquidationRatio: lendingController.liquidation_ratio,
        vaultCollateralTokens: normalizeCollateralTokens,
        oracleLatestPrice,
      }) : ''

      console.log({
        currentBlockLevel,
        liquidationEndLevel: item.liquidation_end_level,
        markedForLiquidationLevel: item.marked_for_liquidation_level,
        liquidationDelayInMinutes,
        loanOutstandingTotal: item.loan_outstanding_total / 10 ** item.loan_decimals,
        loanTokenOracleAddress: item.loan_token?.oracle_id || '',
        liquidationRatio: lendingController.liquidation_ratio,
        vaultCollateralTokens: normalizeCollateralTokens,
        oracleLatestPrice,
      });

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
          apy: 0,
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
  oracleLatestPrice: number
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
  oracleLatestPrice,
}: VaultStatusCheckerType) => {
  if (checkVaultIsInGracePeriod(
    currentBlockLevel,
    markedForLiquidationLevel,
    liquidationDelayInMinutes,
  )){
    return VaultsStatuses.GRACE_PERIOD
  } else if (checkVaultIsAbleToMarkedForLiquidation(
    loanOutstandingTotal,
    loanTokenOracleAddress,
    liquidationRatio,
    vaultCollateralTokens,
    currentBlockLevel,
    liquidationEndLevel,
    markedForLiquidationLevel,
    liquidationDelayInMinutes,
    oracleLatestPrice,
  )){
    return VaultsStatuses.MARK
  } else if (checkVaultLiquidatableStatus(
    loanOutstandingTotal,
    loanTokenOracleAddress,
    liquidationRatio,
    vaultCollateralTokens,
    currentBlockLevel,
    liquidationEndLevel,
    markedForLiquidationLevel,
    liquidationDelayInMinutes,
    oracleLatestPrice,
  )){
    return VaultsStatuses.LIQUIDATABLE
  }

  return VaultsStatuses.ACTIVE
}
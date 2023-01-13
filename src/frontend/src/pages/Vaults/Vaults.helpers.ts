import { VaultGQL, VaultsGQL, VaultType, CollateralType } from 'utils/TypesAndInterfaces/Vaults'
import { State } from 'reducers'

type VaultsStorageProps = {
  vault: Array<VaultGQL>
  vaultsTokensRate: Record<string, number>
  accountPkh?: string
  dipDupTokens: State['tokens']['dipDupTokens']
}

export const normalizeVaultsStorage = (storage: VaultsStorageProps) => {
  const { vault = [], vaultsTokensRate, accountPkh, dipDupTokens } = storage

  if (!vault.length) return []

  return vault.reduce<{
    myVaultsIds: string[], allVaultsIds: string[], vaultsMapper: Record<string, VaultType> 
  }>((acc, item) => {

    const asset = dipDupTokens.find(({ contract }) => contract === item.lending_controller_vaults[0]?.loan_token?.lp_token_address)

    const vaultCollateral = item.lending_controller_vaults[0]?.collateral_balances?.reduce<{
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

    const normallizedVault = {
      borrowedAsset: {
        assetSymbol: asset?.metadata.symbol ?? item.lending_controller_vaults[0]?.loan_token?.loan_token_name,
        ...(asset?.metadata.name ? { assetName: asset?.metadata.name } : {}),
        assetIcon: asset?.metadata.icon,
        amtBorrowed: 0,
        ...(asset?.metadata.symbol
          ? { assetRate: vaultsTokensRate[item.lending_controller_vaults[0]?.loan_token?.loan_token_name === 'tez' ? 'tez' : asset.metadata.symbol] }
          : { assetRate: null }),
        collateralBalance: vaultCollateral.totalRow?.balance ?? 0,
        collateralUtilization: 0,
        apy: 0,
        fee: 0,
      },
      collateralData: vaultCollateral.normalizedCollaterals.concat(
        vaultCollateral.normalizedCollaterals.length > 1 ? [vaultCollateral.totalRow] : [],
      ),
      borrowedAmount: item.lending_controller_vaults[0]?.loan_outstanding_total,
      xtzDelegatedTo: '',
      operators: [],
      sMVKDelegatedTo: '',
      depositors: item.lending_controller_vaults[0]?.vault?.depositors.map(({ depositor_id }) => depositor_id) as Array<string> | undefined,
    }

    acc.vaultsMapper[item.address] = normallizedVault
    acc.allVaultsIds.push(item.address)

    if (accountPkh === item.lending_controller_vaults[0]?.owner_id) {
      acc.myVaultsIds.push(item.address)
    }

    return acc
  }, {
    myVaultsIds: [],
    allVaultsIds: [],
    vaultsMapper: {},
  })
}

type VaultsProps = {
  vaults: Array<VaultsGQL>
}

export const normalizeVaults = (storage: VaultsProps) => {
  const { vaults } = storage

  if (!vaults.length) return []

  const result = vaults

  return []
}

export const getVaultTokensSymbols = ({
  vaults,
  dipDupTokens,
}: {
  vaults?: Array<VaultGQL>
  dipDupTokens: State['tokens']['dipDupTokens']
}) => {
  if (!vaults?.length) return []
  
  return Array.from(
    vaults?.reduce((acc, { lending_controller_vaults }) => {
      // mapping througt vaults to get symbol of each collateral asset
      lending_controller_vaults[0]?.collateral_balances?.forEach(({ token }) => {
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

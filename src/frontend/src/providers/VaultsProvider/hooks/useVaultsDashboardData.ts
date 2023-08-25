import { useState, useEffect } from 'react'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useVaultsContext } from '../vaults.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// types
import { DashboardVaultsTabDataQuery } from 'utils/__generated__/graphql'

// consts
import { GET_VAULTS_DASHBOARD_DATA } from '../queries/vaultsDashboardData.query'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'

// utils
import { EMPTY_VAULTS_DASHBOARD_DATA } from '../vaults.provider.consts'
import { normalizeVaultsDashboardData } from '../helpers/vaultsDashboard.normalizer'

export const useVaultsDashboardData = () => {
  const { bug } = useToasterContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { setVaultsDashboardData, vaultsDashboardData } = useVaultsContext()

  const [indexerData, setIndexerData] = useState<null | DashboardVaultsTabDataQuery>(null)

  useQueryWithRefetch(GET_VAULTS_DASHBOARD_DATA, {
    onCompleted: (data) => {
      setIndexerData(data)
    },
    onError: (e) => {
      console.error(`DappConfigProvider query error: `, e)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
  })

  useEffect(() => {
    if (!indexerData) return

    const { reducedVaultsCollaterals, totalCollateralRatio, averageCollateralRatio, vaultTvl, activeVaults } =
      normalizeVaultsDashboardData({
        indexerData,
        tokensMetadata,
        tokensPrices,
      })

    setVaultsDashboardData({
      reducedVaultsCollaterals,
      totalCollateralRatio,
      averageCollateralRatio,
      vaultTvl,
      activeVaults,
    })
  }, [indexerData, tokensMetadata, tokensPrices])

  return {
    isLoading: vaultsDashboardData === null,
    ...(vaultsDashboardData ?? EMPTY_VAULTS_DASHBOARD_DATA),
  }
}

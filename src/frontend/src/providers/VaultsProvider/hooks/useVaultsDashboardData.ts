import { useEffect, useState } from 'react'

// hooks
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useVaultsContext } from '../vaults.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// types
import { DashboardVaultsTabDataQuery } from 'utils/__generated__/graphql'

// consts
import { EMPTY_VAULTS_DASHBOARD_DATA } from '../vaults.provider.consts'
import { GET_VAULTS_DASHBOARD_DATA } from '../queries/vaultsDashboardData.query'

// utils
import { normalizeVaultsDashboardData } from '../helpers/vaultsDashboard.normalizer'

export const useVaultsDashboardData = () => {
  const { handleQueryError } = useQueryProvider()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { setVaultsDashboardData, vaultsDashboardData } = useVaultsContext()

  const [indexerData, setIndexerData] = useState<null | DashboardVaultsTabDataQuery>(null)

  useGraphQLQuery(GET_VAULTS_DASHBOARD_DATA, {
    variables: {},
    onCompleted: (data) => {
      setIndexerData(data)
    },
    onError: (error) => handleQueryError(error, 'GET_VAULTS_DASHBOARD_DATA'),
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

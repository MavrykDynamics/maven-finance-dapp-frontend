import { useEffect, useState } from 'react'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
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
  const { handleApolloError } = useApolloContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { setVaultsDashboardData, vaultsDashboardData } = useVaultsContext()

  const [indexerData, setIndexerData] = useState<null | DashboardVaultsTabDataQuery>(null)

  useQueryWithRefetch(GET_VAULTS_DASHBOARD_DATA, {
    variables: {},
    onCompleted: (data) => {
      setIndexerData(data)
    },
    onError: (error) => handleApolloError(error, 'GET_VAULTS_DASHBOARD_DATA'),
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

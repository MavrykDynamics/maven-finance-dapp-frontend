import { useState } from 'react'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'

// hooks
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// consts
import { CURRENT_USER_VAULTS_NAMES_QUERY } from '../queries/userVaultsNames.query'

export const useUserVaultsNames = (skip = true) => {
  const { handleQueryError } = useQueryProvider()
  const { userAddress } = useUserContext()

  const [vaultNames, setVaultNames] = useState<string[]>([])

  const { isLoading: loading } = useGraphQLQuery(CURRENT_USER_VAULTS_NAMES_QUERY, {
    skip,
    variables: {
      userAddress: userAddress ?? '',
    },
    onCompleted: (data) => {
      setVaultNames(
        data.lending_controller?.[0]?.vaults?.reduce<string[]>((acc, { vault }) => {
          const name = vault?.name
          if (name) acc.push(name)
          return acc
        }, []) ?? [],
      )
    },
    onError: (error) => handleQueryError(error, 'CURRENT_USER_VAULTS_NAMES_QUERY'),
  })

  return { vaultNames, isLoading: loading }
}

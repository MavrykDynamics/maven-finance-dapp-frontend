import { useState } from 'react'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// hooks
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// consts
import { CURRENT_USER_VAULTS_NAMES_QUERY } from '../queries/userVaultsNames.query'

export const useUserVaultsNames = (skip = true) => {
  const { handleApolloError } = useApolloContext()
  const { userAddress } = useUserContext()

  const [vaultNames, setVaultNames] = useState<string[]>([])

  const { loading } = useQueryWithRefetch(CURRENT_USER_VAULTS_NAMES_QUERY, {
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
    onError: (error) => handleApolloError(error, 'CURRENT_USER_VAULTS_NAMES_QUERY'),
  })

  return { vaultNames, isLoading: loading }
}

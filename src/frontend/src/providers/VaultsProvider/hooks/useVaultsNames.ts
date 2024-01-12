import { useState } from 'react'
import { useQuery } from '@apollo/client'

// hooks
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// consts
import { CURRENT_USER_VAULTS_NAMES_QUERY } from '../queries/userVaultsNames.query'

export const useUserVaultsNames = () => {
  const { handleApolloError } = useApolloContext()
  const { userAddress } = useUserContext()

  const [vaultNames, setVaultNames] = useState<string[]>([])

  const { loading } = useQuery(CURRENT_USER_VAULTS_NAMES_QUERY, {
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

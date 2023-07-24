import { useSubscription } from '@apollo/client'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useState } from 'react'
import { SUBSCRIBE_USER_VAULTS_NAMES } from '../queries/userVaultsNames.query'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'

export const useUserVaultsNames = () => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [vaultNames, setVaultNames] = useState<string[]>([])

  const { loading } = useSubscription(SUBSCRIBE_USER_VAULTS_NAMES, {
    shouldResubscribe: true,
    variables: {
      userAddress: userAddress ?? '',
    },
    onData: ({ data: { data } }) => {
      if (!data) return

      setVaultNames(
        data.lending_controller?.[0]?.vaults?.reduce<string[]>((acc, { vault }) => {
          const name = vault?.name
          if (name) acc.push(name)
          return acc
        }, []) ?? [],
      )
    },
    onError: (error) => {
      console.error(`SUBSCRIBE_USER_VAULTS_NAMES query error: `, error)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
  })

  return { vaultNames, isLoading: loading }
}

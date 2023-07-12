import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useEffect, useMemo, useState } from 'react'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

// consts
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { VaultsContext, VaultsCtxState, VaultsSubsRecordType } from './vaults.provider.types'
import { getVaultsSubscription } from './queries/vaults.query'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { DEFAULT_VAULTS_ACTIVE_SUBS, VAULTS_DATA, VAULTS_USER_MARKET } from './vaults.provider.consts'
import { GetVaultsSubscriptionSubscription } from 'utils/__generated__/graphql'
import { normalizeVaults } from './helpers/vaults.normalizer'

// helpers

export const vaultsContext = React.createContext<VaultsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

export const VaultsProvider = ({ children }: Props) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  const [activeSubs, setActiveSubs] = useState<VaultsSubsRecordType>(DEFAULT_VAULTS_ACTIVE_SUBS)
  const [vaultsCtxState, setVaultsCtxState] = useState<VaultsCtxState>({
    vaultsMapper: {},
  })

  const { loading: isVaultsLoading } = useSubscription(
    getVaultsSubscription({ userAddress, filters: activeSubs[VAULTS_DATA] }),
    {
      skip: !activeSubs[VAULTS_DATA],
      shouldResubscribe: true,
      variables: {
        userAddress: userAddress ?? '',
        marketAddress:
          activeSubs[VAULTS_DATA]?.subType === VAULTS_USER_MARKET ? activeSubs[VAULTS_DATA].marketAddress : '',
      },
      onData: ({ data: { data } }) => {
        if (!data) return

        updateVaultsData(data)
      },
      onError: (error) => handleSubError(error, 'getVaultsSubscription'),
    },
  )

  const updateVaultsData = (indexerData: GetVaultsSubscriptionSubscription) => {
    const { vaultsMapper } = normalizeVaults({ indexerData })

    setVaultsCtxState((prev) => ({
      ...prev,
      vaultsMapper: { ...prev.vaultsMapper, ...vaultsMapper },
    }))
  }

  const changeVaultsSubscriptionsList = (newSkips: Partial<VaultsSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const providerValue = useMemo(() => {
    return {
      ...vaultsCtxState,
      changeVaultsSubscriptionsList,
      isLoading: isVaultsLoading,
    }
  }, [vaultsCtxState])
  return <vaultsContext.Provider value={providerValue}>{children}</vaultsContext.Provider>
}

export const useVaultsContext = () => {
  const context = useContext(vaultsContext)

  if (!context) {
    throw new Error('vaultsContext should be used within VaultsProvider')
  }

  return context
}

export default VaultsProvider

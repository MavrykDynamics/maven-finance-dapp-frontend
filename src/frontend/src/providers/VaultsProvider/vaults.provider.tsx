import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useEffect, useMemo, useState } from 'react'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types

// consts
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import {
  VaultsContext,
  VaultsCtxState,
  VaultsSubsLoadingsRecordType,
  VaultsSubsRecordType,
} from './vaults.provider.types'
import { getVaultsSubscription } from './queries/vaults.query'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { DEFAULT_VAULTS_ACTIVE_SUBS, DEFAULT_VAULTS_SUBS_LOADINGS, VAULTS_DATA } from './vaults.provider.consts'
import { GetVaultsSubscriptionSubscription } from 'utils/__generated__/graphql'
import { normalizeVaults } from './helpers/vaults.normalizer'
import { usePrevious } from 'react-use'

// helpers

export const vaultsContext = React.createContext<VaultsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

export const VaultsProvider = ({ children }: Props) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const prevUserAddress = usePrevious(userAddress)

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  const [loadings, setLoadings] = useState<VaultsSubsLoadingsRecordType>(DEFAULT_VAULTS_SUBS_LOADINGS)
  const [activeSubs, setActiveSubs] = useState<VaultsSubsRecordType>(DEFAULT_VAULTS_ACTIVE_SUBS)
  const [vaultsMarketToSub, setVaultsMarketToSub] = useState<string | null>(null)
  const [vaultsCtxState, setVaultsCtxState] = useState<VaultsCtxState>({
    vaultsMapper: {},
    myVaultsIds: {
      all: [],
    },
    allVaultsIds: [],
    permissionedVaultsIds: [],
  })

  useEffect(() => {
    if (prevUserAddress !== userAddress) {
      setLoadings((prev) => ({
        ...prev,
        [VAULTS_DATA]: true,
      }))
    }
  }, [userAddress])

  useSubscription(getVaultsSubscription({ userAddress, filters: activeSubs[VAULTS_DATA] }), {
    skip: !activeSubs[VAULTS_DATA],
    shouldResubscribe: true,
    variables: {
      userAddress: userAddress ?? '',
      marketAddress: vaultsMarketToSub ?? '',
    },
    onData: ({ data: { data } }) => {
      if (!data) return

      updateVaultsData(data, vaultsMarketToSub, userAddress)
    },
    onError: (error) => handleSubError(error, 'getVaultsSubscription'),
  })

  const updateVaultsData = (
    indexerData: GetVaultsSubscriptionSubscription,
    marketAddress: string | null,
    userAddress: string | null,
  ) => {
    const { vaultsMapper, allVaultsIds, myVaultsIds, permissionedVaultsIds } = normalizeVaults({
      indexerData,
      marketAddress,
      userAddress,
    })

    setLoadings((prev) => ({
      ...prev,
      [VAULTS_DATA]: false,
    }))

    setVaultsCtxState((prev) => ({
      ...prev,
      vaultsMapper: { ...prev.vaultsMapper, ...vaultsMapper },
      allVaultsIds,
      permissionedVaultsIds,
      myVaultsIds,
    }))
  }

  console.log({
    loadings,
    vaultsCtxState,
  })

  const changeVaultsSubscriptionsList = (newSkips: Partial<VaultsSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const providerValue = useMemo(() => {
    const isVaultsDataLoading = activeSubs[VAULTS_DATA] ? loadings[VAULTS_DATA] : false

    console.log({
      ...vaultsCtxState,
      changeVaultsSubscriptionsList,
      setVaultsMarketToSub,
      isLoading: isVaultsDataLoading,
    })

    return {
      ...vaultsCtxState,
      changeVaultsSubscriptionsList,
      setVaultsMarketToSub,
      isLoading: isVaultsDataLoading,
    }
  }, [vaultsCtxState, activeSubs])
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

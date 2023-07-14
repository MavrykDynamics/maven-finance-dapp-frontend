import { ApolloError, useSubscription } from '@apollo/client'
import { usePrevious } from 'react-use'
import React, { useContext, useEffect, useMemo, useState } from 'react'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types

// consts
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { VaultsContext, VaultsCtxState, VaultsSubsRecordType } from './vaults.provider.types'
import {
  SUBSCRIBE_TO_ALL_VAULTS,
  SUBSCRIBE_TO_USER_MARKET_VAULTS,
  getUserVaultsSubscription,
} from './queries/vaults.query'
import { useUserContext } from 'providers/UserProvider/user.provider'
import {
  DEFAULT_VAULTS_ACTIVE_SUBS,
  DEFAULT_VAULTS_CONTEXT,
  EMPTY_VAULTS_CONTEXT,
  VAULTS_ALL,
  VAULTS_DATA,
  VAULTS_USER_ALL,
  VAULTS_USER_DEPOSITOR,
  VAULTS_USER_MARKET,
} from './vaults.provider.consts'
import { GetVaultsSubscriptionSubscription } from 'utils/__generated__/graphql'

// helpers
import { normalizeVaults } from './helpers/vaults.normalizer'
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'

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

  const [activeSubs, setActiveSubs] = useState<VaultsSubsRecordType>(DEFAULT_VAULTS_ACTIVE_SUBS)
  const [vaultsMarketToSub, setVaultsMarketToSub] = useState<string | null>(null)
  const [vaultsCtxState, setVaultsCtxState] = useState<VaultsCtxState>(DEFAULT_VAULTS_CONTEXT)

  useEffect(() => {
    if (prevUserAddress !== userAddress) {
      setVaultsCtxState((prev) => ({
        ...prev,
        permissionedVaultsIds: null,
        myVaultsIds: null,
        myVaultsMarketsIds: null,
      }))
    }
  }, [userAddress])

  useSubscription(getUserVaultsSubscription({ userAddress, filters: activeSubs[VAULTS_DATA] }), {
    skip: activeSubs[VAULTS_DATA] !== 'userIsOwner' && activeSubs[VAULTS_DATA] !== 'userIsDepositor',
    shouldResubscribe: true,
    variables: {
      userAddress: userAddress ?? '',
    },
    onData: ({ data: { data } }) => {
      if (!data) return

      updateVaultsData(data, userAddress, activeSubs[VAULTS_DATA])
    },
    onError: (error) => handleSubError(error, 'getVaultsSubscription'),
  })

  useSubscription(SUBSCRIBE_TO_ALL_VAULTS, {
    skip: activeSubs[VAULTS_DATA] !== 'allVaults',
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      updateVaultsData(data, userAddress, activeSubs[VAULTS_DATA])
    },
    onError: (error) => handleSubError(error, 'getVaultsSubscription'),
  })

  useSubscription(SUBSCRIBE_TO_USER_MARKET_VAULTS, {
    skip: activeSubs[VAULTS_DATA] !== 'userIsOwnerAndCertainMarket',
    shouldResubscribe: true,
    variables: {
      userAddress: userAddress ?? '',
      marketAddress: vaultsMarketToSub ?? '',
    },
    onData: ({ data: { data } }) => {
      if (!data) return

      updateVaultsData(data, userAddress, activeSubs[VAULTS_DATA])
    },
    onError: (error) => handleSubError(error, 'getVaultsSubscription'),
  })

  const updateVaultsData = (
    indexerData: GetVaultsSubscriptionSubscription,
    userAddress: string | null,
    filterType: VaultsSubsRecordType[typeof VAULTS_DATA],
  ) => {
    const { vaultsMapper, allVaultsIds, myVaultsIds, permissionedVaultsIds } = normalizeVaults({
      indexerData,
      userAddress,
    })

    setVaultsCtxState((prev) => ({
      ...prev,
      vaultsMapper: { ...prev.vaultsMapper, ...vaultsMapper },
      allVaultsIds:
        filterType === VAULTS_ALL
          ? allVaultsIds
          : Array.from(new Set([...(prev?.allVaultsIds ?? []), ...allVaultsIds])),
      permissionedVaultsIds:
        filterType === VAULTS_ALL || filterType === VAULTS_USER_DEPOSITOR
          ? permissionedVaultsIds
          : Array.from(new Set([...(prev?.permissionedVaultsIds ?? []), ...permissionedVaultsIds])),
      myVaultsIds:
        filterType === VAULTS_ALL || filterType === VAULTS_USER_ALL
          ? myVaultsIds
          : Array.from(new Set([...(prev?.myVaultsIds ?? []), ...myVaultsIds])),
      // myVaultsMarketsIds:
      //   filterType === VAULTS_USER_MARKET || filterType === VAULTS_ALL || filterType === VAULTS_USER_ALL
      //     ? myVaultsMarketsIds
      //     : { ...prev.myVaultsMarketsIds, ...myVaultsMarketsIds },
    }))
  }

  const changeVaultsSubscriptionsList = (newSkips: Partial<VaultsSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const providerValue = useMemo(() => {
    const commonToReturn = {
      changeVaultsSubscriptionsList,
      setVaultsMarketToSub,
    }
    const { vaultsMapper, myVaultsIds, allVaultsIds, permissionedVaultsIds } = vaultsCtxState
    const isLoading =
      vaultsMapper === null ||
      (activeSubs[VAULTS_DATA] === 'allVaults' && allVaultsIds === null) ||
      (activeSubs[VAULTS_DATA] === 'userIsDepositor' && permissionedVaultsIds === null) ||
      (activeSubs[VAULTS_DATA] === 'userIsOwner' && myVaultsIds === null)

    if (isLoading) {
      return {
        ...commonToReturn,
        ...EMPTY_VAULTS_CONTEXT,
        isLoading: true,
      }
    }

    const nonNullableProviderValue = replaceNullValuesWithDefault<VaultsCtxState>(vaultsCtxState, EMPTY_VAULTS_CONTEXT)
    return {
      ...commonToReturn,
      ...nonNullableProviderValue,
      isLoading: false,
    }
  }, [vaultsCtxState, activeSubs])

  console.log('vaults', { vaultsCtxState, providerValue, activeSubs })
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

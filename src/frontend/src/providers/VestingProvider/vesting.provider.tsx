import React, { useContext, useMemo, useState } from 'react'
import { ApolloError } from '@apollo/client'

// providers
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { NullableVestingContextStateType, VestingContext, VestingSubsRecordType } from './vesting.provider.types'
import { GetVestingStorageQuery } from 'utils/__generated__/graphql'

// consts
import { DEFAULT_VESTING_CTX, DEFAULT_VESTING_SUBS, VESTING_STORAGE_DATA_SUB } from './helpers/vesting.consts'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// queries
import { GET_VESTING_STORAGE_QUERY } from './queries/vestingStorage.query'

// utils
import { getVestingProviderReturnValue } from './helpers/vesting.utils'
import { normalizeVestingStorage } from './helpers/vesting.normalizer'

// context
export const vestingContext = React.createContext<VestingContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const VestingProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const [vestingCtxState, setVestingCtxState] = useState<NullableVestingContextStateType>(DEFAULT_VESTING_CTX)
  const [activeSubs, setActiveSubs] = useState<VestingSubsRecordType>(DEFAULT_VESTING_SUBS)

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribes
  useQueryWithRefetch(GET_VESTING_STORAGE_QUERY, {
    skip: !activeSubs[VESTING_STORAGE_DATA_SUB],
    onCompleted: (data) => {
      if (!data) return
      updateVestingStorage(data)
    },
    onError: (error) => handleSubError(error, 'GET_VESTING_STORAGE_QUERY'),
  })

  // methods to update context data
  const updateVestingStorage = (data: GetVestingStorageQuery) => {
    const { vesteeIds, vesteesMapper, totalClaimedAmount, totalVestedAmount, address } = normalizeVestingStorage(data)

    setVestingCtxState((prev) => ({
      ...prev,
      vesteeIds,
      vesteesMapper,
      totalClaimedAmount,
      totalVestedAmount,
      address,
    }))
  }

  //   set what data to subscribe
  const changeVestingSubscriptionsList = (newSkips: Partial<VestingSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const contextProviderValue = useMemo(
    () =>
      getVestingProviderReturnValue({
        vestingCtxState,
        changeVestingSubscriptionsList,
        activeSubs,
      }),
    [activeSubs, vestingCtxState],
  )

  return <vestingContext.Provider value={contextProviderValue}>{children}</vestingContext.Provider>
}

export const useVestingContext = () => {
  const context = useContext(vestingContext)

  if (!context) {
    throw new Error('useVestingContext should be used within VestingProvider')
  }

  return context
}

export default VestingProvider

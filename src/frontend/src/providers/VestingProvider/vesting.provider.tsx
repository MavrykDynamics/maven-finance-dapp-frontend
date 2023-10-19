import React, { useContext, useMemo, useState } from 'react'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'

// types
import { NullableVestingContextStateType, VestingContext, VestingSubsRecordType } from './vesting.provider.types'

// consts
import { GET_VESTING_STORAGE_QUERY } from './queries/vesting.query'
import { DEFAULT_VESTING_CTX, DEFAULT_VESTING_SUBS, VESTING_STORAGE_DATA_SUB } from './helpers/vesting.consts'

// utils
import { getVestingProviderReturnValue } from './helpers/vesting.utils'
import { normalizeVestingStorage } from './helpers/vesting.normalizer'

// context
export const vestingContext = React.createContext<VestingContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const VestingProvider = ({ children }: Props) => {
  const { handleApolloError } = useApolloContext()

  const [vestingCtxState, setVestingCtxState] = useState<NullableVestingContextStateType>(DEFAULT_VESTING_CTX)
  const [activeSubs, setActiveSubs] = useState<VestingSubsRecordType>(DEFAULT_VESTING_SUBS)

  // subscribes
  useQueryWithRefetch(GET_VESTING_STORAGE_QUERY, {
    skip: !activeSubs[VESTING_STORAGE_DATA_SUB],
    onCompleted: (data) => {
      const { vesteesAddresses, vesteesMapper, totalClaimedAmount, totalVestedAmount, address } =
        normalizeVestingStorage(data)

      setVestingCtxState((prev) => ({
        ...prev,
        vesteesAddresses,
        vesteesMapper,
        totalClaimedAmount,
        totalVestedAmount,
        address,
      }))
    },
    onError: (error) => handleApolloError(error, 'GET_VESTING_STORAGE_QUERY'),
  })

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

import React, { useContext, useMemo, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'

// types
import { NullableTreasuryContextStateType, TreasuryContext, TreasurySubsRecordType } from './treasury.provider.types'
import { GetTreasuryStorageDataQuery, GetTreasurySmvkBalancesQuery } from 'utils/__generated__/graphql'

// consts
import { GET_TREASURY_STORAGE_QUERY, GET_TREASURY_SMVK_BALANCES } from './queries/treasury.queries'
import { DEFAULT_TREASURY_CTX, DEFAULT_TREASURY_SUBS, TREASURY_STORAGE_DATA_SUB } from './helpers/treasury.consts'

// utils
import { curry } from 'utils/curry'
import { getTreasuryProviderReturnValue } from './helpers/treasury.utils'
import { normalizeTreasuryStorage } from './helpers/treasury.normalizer'

export const treasuryContext = React.createContext<TreasuryContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const TreasuryProvider = ({ children }: Props) => {
  const { handleApolloError } = useApolloContext()

  const [treasuryCtxState, setTreasuryCtxState] = useState<NullableTreasuryContextStateType>(DEFAULT_TREASURY_CTX)
  const [activeSubs, setActiveSubs] = useState<TreasurySubsRecordType>(DEFAULT_TREASURY_SUBS)
  const [allowTreasurtSMVKBalances, setAllowTreasurySMVKBalances] = useState(false)

  const updateTreasuryStorage = (treasury: GetTreasuryStorageDataQuery, smvkBalances: GetTreasurySmvkBalancesQuery) => {
    const data = { ...treasury, ...smvkBalances }
    const treasuryMapper = normalizeTreasuryStorage(data)

    setTreasuryCtxState((prev) => ({
      ...prev,
      treasuryMapper,
    }))
  }

  //   helper to collect treasury data for normalizer using curry  -----------------------------
  const treasuryNormalizerDataUpdaterRef = useRef(curry(updateTreasuryStorage))

  // subscribes
  useQueryWithRefetch(GET_TREASURY_STORAGE_QUERY, {
    skip: !activeSubs[TREASURY_STORAGE_DATA_SUB],
    onCompleted: (data) => {
      if (!data) return
      updateTreasuryAddresses(data)

      //   pass the first part of data -> treasury data
      treasuryNormalizerDataUpdaterRef.current =
        treasuryNormalizerDataUpdaterRef.current<GetTreasuryStorageDataQuery>(data)
      setAllowTreasurySMVKBalances(true)
    },
    onError: (error) => handleApolloError(error, 'GET_TREASURY_STORAGE_QUERY'),
  })

  useQuery(GET_TREASURY_SMVK_BALANCES, {
    skip: !allowTreasurtSMVKBalances || treasuryCtxState.treasuryAddresses === null,
    variables: {
      addresses: treasuryCtxState.treasuryAddresses,
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (!data) {
        setAllowTreasurySMVKBalances(false)
        return
      }

      //  pass the second part of data -> user balances data
      treasuryNormalizerDataUpdaterRef.current<GetTreasurySmvkBalancesQuery>(data)
      // reset for future calls
      treasuryNormalizerDataUpdaterRef.current = curry(updateTreasuryStorage)
      // disallow this query until new data for treasury is received
      setAllowTreasurySMVKBalances(false)
    },
    onError: (error) => handleApolloError(error, 'GET_TREASURY_SMVK_BALANCES'),
  })

  // methods to update context data
  const updateTreasuryAddresses = ({ treasury }: GetTreasuryStorageDataQuery) => {
    setTreasuryCtxState((prev) => ({
      ...prev,
      treasuryAddresses: treasury.map(({ address }) => address).filter((address) => address !== ''),
    }))
  }

  //   set what data to subscribe
  const changeTreasurySubscriptionsList = (newSkips: Partial<TreasurySubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const contextProviderValue = useMemo(
    () =>
      getTreasuryProviderReturnValue({
        treasuryCtxState,
        changeTreasurySubscriptionsList,
        activeSubs,
      }),
    [activeSubs, treasuryCtxState],
  )

  return <treasuryContext.Provider value={contextProviderValue}>{children}</treasuryContext.Provider>
}

export const useTreasuryContext = () => {
  const context = useContext(treasuryContext)

  if (!context) {
    throw new Error('useTreasuryContext should be used within TreasuryProvider')
  }

  return context
}

export default TreasuryProvider

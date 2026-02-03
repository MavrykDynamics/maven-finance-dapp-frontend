import React, { useCallback, useContext, useMemo, useRef, useState } from 'react'
// hooks
import { useGraphQLQuery, useGraphQLQueryOnce } from 'providers/QueryProvider/useGraphQLQuery'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'

// types
import { NullableTreasuryContextStateType, TreasuryContext, TreasurySubsRecordType } from './treasury.provider.types'
import { GetTreasurySmvnBalancesQuery, GetTreasuryStorageDataQuery } from 'utils/__generated__/graphql'

// consts
import { GET_TREASURY_SMVN_BALANCES, GET_TREASURY_STORAGE_QUERY } from './queries/treasury.queries'
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
  const { handleQueryError } = useQueryProvider()

  const [treasuryCtxState, setTreasuryCtxState] = useState<NullableTreasuryContextStateType>(DEFAULT_TREASURY_CTX)
  const [activeSubs, setActiveSubs] = useState<TreasurySubsRecordType>(DEFAULT_TREASURY_SUBS)
  const [allowTreasurySMVNBalances, setAllowTreasurySMVNBalances] = useState(false)

  // methods to update context data
  const updateTreasuryStorage = (treasury: GetTreasuryStorageDataQuery, smvnBalances: GetTreasurySmvnBalancesQuery) => {
    const data = { ...treasury, ...smvnBalances }
    const treasuryMapper = normalizeTreasuryStorage(data)

    setTreasuryCtxState((prev) => ({
      ...prev,
      treasuryMapper,
    }))
  }

  const updateTreasuryAddresses = ({ treasury }: GetTreasuryStorageDataQuery) => {
    setTreasuryCtxState((prev) => ({
      ...prev,
      treasuryAddresses: treasury.map(({ address }) => address).filter((address) => address !== ''),
    }))
  }

  //   helper to collect treasury data for normalizer using curry  -----------------------------
  const treasuryNormalizerDataUpdaterRef = useRef(curry(updateTreasuryStorage))

  // subscribes
  useGraphQLQuery(GET_TREASURY_STORAGE_QUERY, {
    skip: !activeSubs[TREASURY_STORAGE_DATA_SUB],
    onCompleted: (data) => {
      updateTreasuryAddresses(data)

      //   pass the first part of data -> treasury data
      treasuryNormalizerDataUpdaterRef.current =
        treasuryNormalizerDataUpdaterRef.current<GetTreasuryStorageDataQuery>(data)
      setAllowTreasurySMVNBalances(true)
    },
    onError: (error) => handleQueryError(error, 'GET_TREASURY_STORAGE_QUERY'),
  })

  useGraphQLQueryOnce(GET_TREASURY_SMVN_BALANCES, {
    skip: !allowTreasurySMVNBalances || treasuryCtxState.treasuryAddresses === null,
    variables: {
      addresses: treasuryCtxState.treasuryAddresses,
    },
    onCompleted: (data) => {
      if (!data) {
        setAllowTreasurySMVNBalances(false)
        return
      }

      //  pass the second part of data -> user balances data
      treasuryNormalizerDataUpdaterRef.current<GetTreasurySmvnBalancesQuery>(data)
      // reset for future calls
      treasuryNormalizerDataUpdaterRef.current = curry(updateTreasuryStorage)
      // disallow this query until new data for treasury is received
      setAllowTreasurySMVNBalances(false)
    },
    onError: (error) => handleQueryError(error, 'GET_TREASURY_SMVN_BALANCES'),
  })

  const changeTreasurySubscriptionsList = useCallback((newSkips: Partial<TreasurySubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }, [])

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

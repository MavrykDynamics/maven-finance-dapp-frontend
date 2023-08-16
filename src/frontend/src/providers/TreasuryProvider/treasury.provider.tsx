import { ApolloError, useQuery } from '@apollo/client'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import React, { useContext, useMemo, useState } from 'react'
import { NullableTreasuryContextStateType, TreasuryContext, TreasurySubsRecordType } from './treasury.provider.types'
import { DEFAULT_TREASURY_CTX, DEFAULT_TREASURY_SUBS, TREASURY_STORAGE_QUERY } from './helpers/treasury.consts'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { GET_TREASURY_STORAGE_QUERY, GET_TREASURY_USER_BALANCES } from './queries/treasury.queries'
import { getTreasuryProviderReturnValue } from './helpers/treasury.utils'
import { normalizeTreasuryStorage } from './helpers/treasury.normalizer'
import { GetTreasuryStorageDataQuery, GetTreasuryUserBalancesQuery } from 'utils/__generated__/graphql'

function curry<T extends (...args: any[]) => any>(func: T): (...args: any[]) => any {
  return function curried(...args: any[]): any {
    if (args.length >= func.length) {
      // @ts-ignore
      return func.apply(this, args)
    } else {
      return function (...args2: any[]): any {
        // @ts-ignore
        return curried.apply(this, args.concat(args2))
      }
    }
  }
}

export const treasuryContext = React.createContext<TreasuryContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const TreasuryProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const [treasuryCtxState, setTreasuryCtxState] = useState<NullableTreasuryContextStateType>(DEFAULT_TREASURY_CTX)
  const [activeSubs, setActiveSubs] = useState<TreasurySubsRecordType>(DEFAULT_TREASURY_SUBS)
  const [allowUserBalances, setAllowUserBalances] = useState(false)

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribes
  useQueryWithRefetch(GET_TREASURY_STORAGE_QUERY, {
    skip: !activeSubs[TREASURY_STORAGE_QUERY],
    onCompleted: (data) => {
      if (!data) return
      updateTreasuryAddresses(data)

      //   pass the first part of data -> treasury data
      curriedUpdateStorageFn(data)
      setAllowUserBalances(true)
    },
    onError: (error) => handleSubError(error, 'GET_TREASURY_STORAGE_QUERY'),
  })

  useQuery(GET_TREASURY_USER_BALANCES, {
    skip: !allowUserBalances || treasuryCtxState.treasuryAddresses === null,
    variables: {
      addresses: treasuryCtxState.treasuryAddresses,
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (!data) {
        setAllowUserBalances(false)
        return
      }

      //   pass the second part of data -> user balances data
      curriedUpdateStorageFn(data)
      setAllowUserBalances(false)
    },
    onError: (error) => handleSubError(error, 'GET_TREASURY_USER_BALANCES'),
  })

  // methods to update context data
  const updateTreasuryAddresses = ({ treasury }: GetTreasuryStorageDataQuery) => {
    setTreasuryCtxState((prev) => ({
      ...prev,
      treasuryAddresses: treasury.map(({ address }) => address).filter((address) => address !== ''),
    }))
  }

  const updateTreasuryStorage = (treasury: GetTreasuryStorageDataQuery, userBalances: GetTreasuryUserBalancesQuery) => {
    const data = { ...treasury, ...userBalances }
    const treasuryMapper = normalizeTreasuryStorage(data)

    setTreasuryCtxState((prev) => ({
      ...prev,
      treasuryMapper,
    }))
  }

  //   helper to colleact treasury data for normalizer
  const curriedUpdateStorageFn = useMemo(() => curry(updateTreasuryStorage), [])

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

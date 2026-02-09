import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { SingleValueData } from 'lightweight-charts'
import * as signalR from '@microsoft/signalr'

// consts
import { USER_DATA_QUERY } from './queries/userData.query'
import { DEFAULT_USER, DEFAULT_USER_TZKT_TOKENS } from './helpers/user.consts'
import { dappClient } from 'providers/UserProvider/wallet/WalletCore'
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserApi } from './hooks/useUserApi'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'

// helpers
import { normalizeUserIndexerTokensBalances, openTzktWebSocket } from './helpers/userBalances.helpers'
import { normalizeUser } from './helpers/userData.helpers'
import { getUsersFarmRewards } from './helpers/userRewards.helpers'
import { currentIndexerLevelProxy } from 'providers/common/utils/observeCurrentIndexerLevel'

// types
import { GetUserDataQuery } from 'utils/__generated__/graphql'
import {
  UserContext,
  UserContextStateType,
  UserHistoryData,
  UserLoansData,
  UserRewardsType,
  UserTzKtTokenBalances,
} from './user.provider.types'

export const userContext = React.createContext<UserContext>(undefined!)

type Props = {
  children: React.ReactNode
}

// Instance of Dapp wallet
export const DAPP_INSTANCE = dappClient()
const hasUserInLocalStorage =
  localStorage.getItem('beacon:active-account') && localStorage.getItem('beacon:active-account') !== 'undefined'

/**
 * ADJUSTMENTS:
 * 1. on changing user do not reopen socket, just update filter (invoke), currently hadn't found any example of it
 */
export const UserProvider = ({ children }: Props) => {
  const { handleQueryError } = useQueryProvider()
  const { tokensMetadata } = useTokensContext()
  const {
    contractAddresses: { mvnTokenAddress },
  } = useDappConfigContext()

  // track whether we've loaded user on init, if we have his wallet data in local storage
  const isUserRestored = useRef<boolean>(false)

  const tzktSocket = useRef<null | signalR.HubConnection>(null)
  const currentIndexedLvlListenerId = useRef<null | string>(null)

  const [userCtxState, setUserCtxState] = useState<UserContextStateType>(DEFAULT_USER)
  const [userTzktTokens, setUserTzktTokens] = useState<UserTzKtTokenBalances>(DEFAULT_USER_TZKT_TOKENS)

  const [isTzktBalancesLoading, setIsTzktBalancesLoading] = useState(false)
  const [isUserLoading, setUserLoading] = useState(hasUserInLocalStorage && !isUserRestored.current)

  /**
   * we can start restoring user from localStorage if:
   *    1. we have his data in localStorage
   *    2. we have tokensAddresses we need to load balances for
   *    3. we have mvnToken address, so set its balance
   *    4. we haven't loaded user data previously in this app mount
   *    5. we have tzktSocket started to attach listeners to it
   */
  const canRestoreUser =
    hasUserInLocalStorage &&
    Object.keys(tokensMetadata).length !== 0 &&
    mvnTokenAddress !== null &&
    !isUserRestored.current

  // open socket for tzkt without listeners, cuz don't have user address to subscribe
  useEffect(() => {
    openTzktWebSocket()
      .then((socket) => (tzktSocket.current = socket))
      .catch((e) => console.error(e))

    return () => {
      tzktSocket?.current?.stop()
      isUserRestored.current = false
    }
  }, [])

  // getter & setter for tzktSocket
  const getTzktSocket = useCallback(() => tzktSocket.current, [])
  const setTzktSocket = useCallback(
    (newTzktSocket: signalR.HubConnection | null) => (tzktSocket.current = newTzktSocket),
    [],
  )

  const { changeUser, connect, restore, signOut } = useUserApi({
    setUserLoading,
    setIsTzktBalancesLoading,
    setUserCtxState,
    setUserTzktTokens,

    getTzktSocket,
    setTzktSocket,

    userCtxState,
  })

  // effect to perform restoring user from localStorage (silently, no modal)
  useEffect(() => {
    if (canRestoreUser) restore()
  }, [canRestoreUser, restore])

  // subscribe to user's indexer data
  useGraphQLQuery(USER_DATA_QUERY, {
    skip: !userCtxState.userAddress,
    variables: {
      userAddress: userCtxState.userAddress ?? '',
    },
    onCompleted: (indexerData) => setUserIndexerData(indexerData),
    onError: (error) => handleQueryError(error, 'USER_DATA_QUERY'),
  })

  /**
   * User farm rewards depends on current indexed level, and every time level updates we need to re-calc farm rewards
   * to reduce amount of needed re-renders, we re-calc farm rewards every 3rd level change
   *
   * skip when user don't participated any farms
   */
  useEffect(() => {
    const userFarms = userCtxState.rewards?.farmAccounts ?? []
    if (Object.keys(userFarms).length !== 0) {
      setUserCtxState((prev) => ({
        ...prev,
        availableFarmRewards: getUsersFarmRewards({
          userFarmsRewardsDataFromIndexer: userFarms,
          currentLvl: currentIndexerLevelProxy.currentIndexedLevel,
        }),
      }))
      currentIndexedLvlListenerId.current = currentIndexerLevelProxy.registerListener((newIndexerLvl: number) => {
        setUserCtxState((prev) => ({
          ...prev,
          availableFarmRewards: getUsersFarmRewards({
            userFarmsRewardsDataFromIndexer: userFarms,
            currentLvl: newIndexerLvl,
          }),
        }))
      })
    }

    return () => {
      if (currentIndexedLvlListenerId.current)
        currentIndexerLevelProxy.removeListener(currentIndexedLvlListenerId.current)
    }
  }, [userCtxState.rewards?.farmAccounts])

  const setUserLoansData = useCallback((userLoansData: UserLoansData | null) => {
    setUserCtxState((prev) => ({
      ...prev,
      userLoansData,
    }))
  }, [])

  const setUserHistoryData = useCallback((page: number, userHistoryData: UserHistoryData, itemsAmount: number) => {
    setUserCtxState((prev) => ({
      ...prev,
      actionsHistory: {
        paginatedList: { ...prev.actionsHistory.paginatedList, [page]: userHistoryData },
        itemsAmount,
      },
    }))
  }, [])

  const setUserRewards = useCallback((userRewards: UserRewardsType | null) => {
    setUserCtxState((prev) => ({
      ...prev,
      rewards: userRewards,
    }))
  }, [])

  const setUserEarningHistory = useCallback((userEarning: Array<SingleValueData> | null) => {
    setUserCtxState((prev) => ({
      ...prev,
      earningHistory: userEarning,
    }))
  }, [])

  const setUserIndexerData = useCallback(
    (indexerData: GetUserDataQuery) => {
      // if user does not exists
      if (indexerData.maven_user.length === 0) {
        setUserLoading(false)
        return
      }

      const { tokensBalances, availableLoansRewards, userMTokens } = normalizeUserIndexerTokensBalances({
        indexerData,
        tokensMetadata,
        mvnTokenAddress: mvnTokenAddress,
      })

      const normalizedUserData = normalizeUser({ indexerData })

      setUserCtxState((prev) => ({
        ...prev,
        ...normalizedUserData,
        availableLoansRewards,
        userMTokens,
        userTokensBalances: {
          ...prev.userTokensBalances,
          ...tokensBalances,
        },
      }))
      setUserLoading(false)
    },
    [mvnTokenAddress, tokensMetadata],
  )

  const providerValue = useMemo(() => {
    const isLoading = isUserLoading || isTzktBalancesLoading

    /**
     * set isUserRestored to true, when:
     *    1. we haven't restored user
     *    2. we have user address set in context (user data loading started)
     *    3. loading are false, means, that user has been loaded
     *    or 4. we don't have user's wallet in localStorage, and we can't restore him
     */
    if ((!isUserRestored.current && userCtxState.userAddress && !isLoading) || !hasUserInLocalStorage) {
      isUserRestored.current = true
    }

    // need to remove m[MVN] token from userTzktTokens, cuz value is always outdated
    // and for that tokens values are used from our indexer, not tzkt socket
    const {
      [SMVN_TOKEN_ADDRESS]: smvn_balance,
      [mvnTokenAddress ?? '']: mvn_balance,
      ...tzktTokensWithoutMVNToken
    } = userTzktTokens.tokens

    return {
      ...userCtxState,
      userTokensBalances: {
        ...userCtxState.userTokensBalances,
        ...(userCtxState.userAddress === userTzktTokens.userAddress ? tzktTokensWithoutMVNToken : {}),
      },
      isUserRestored: isUserRestored.current,
      isLoading,
      connect,
      signOut,
      changeUser,
      setUserLoansData,
      setUserHistoryData,
      setUserEarningHistory,
      setUserRewards,
    }
  }, [
    userCtxState,
    userTzktTokens,
    isUserLoading,
    isTzktBalancesLoading,
    mvnTokenAddress,
    connect,
    signOut,
    changeUser,
    setUserLoansData,
    setUserHistoryData,
    setUserEarningHistory,
    setUserRewards,
  ])

  return <userContext.Provider value={providerValue}>{children}</userContext.Provider>
}

export const useUserContext = () => {
  const context = useContext(userContext)

  if (!context) {
    throw new Error('userContext should be used within UserProvider')
  }

  return context
}

export default UserProvider

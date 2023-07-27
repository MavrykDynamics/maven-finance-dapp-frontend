import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { useSubscription } from '@apollo/client'

// consts
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { SUBSCRIPTION_INDEXER_LVL } from 'providers/DappConfigProvider/queries/indexerLvl.query'
import { DEFAULT_USER } from './helpers/user.consts'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { dappClient } from 'providers/UserProvider/wallet/WalletCore'

// context
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// helpers
import {
  attachTzktSocketsEventHandlers,
  fetchTzktUserBalances,
  normalizeUserIndexerTokensBalances,
  normalizeUserTzktTokensBalances,
  openTzktWebSocket,
} from './helpers/userBalances.helpers'
import { normalizeUser } from './helpers/userData.helpers'
import { sleep } from 'utils/api/sleep'
import { getUsersFarmRewards } from './helpers/userRewards.helpers'

// queries
import { SUBSCRIBE_USER_DATA } from './queries/userData.query'

// types
import { UserContext, UserContextStateType, UserTzktTokensBalancesType } from './user.provider.types'

// TODO: remove after user addres won't be needed in redux actions
import { useDispatch } from 'react-redux'
import { DISCONNECT, SET_REDUX_USER } from 'reducers/wallet'

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
  const { tokensMetadata } = useTokensContext()
  const { bug, info, success, loading, hideToasterMessage } = useToasterContext()

  const dispatch = useDispatch()

  const ws = useRef<null | signalR.HubConnection>(null)
  const lastSavedLevel = useRef<number>(0)

  const [userCtxState, setUserCtxState] = useState<UserContextStateType>(DEFAULT_USER)
  const [isTzktBalancesLoading, setIsTzktBalancesLoading] = useState(false)

  // track whether we've loaded user on init, if we have his wallet data in local storage
  const isRunnedInitialConnect = useRef<null | boolean>(false)
  // we can startInitialUserLoading if:
  const canStartUserInitialLoading =
    // we have his data in localStorage
    hasUserInLocalStorage &&
    // we have tokensAddresses we need to load balances for
    Object.keys(tokensMetadata).length &&
    // we haven't loaded user data previously in this app mount
    !isRunnedInitialConnect.current &&
    // we have tzktSocket started to attach listeners to it
    ws.current

  // open socket for tzkt without listeners, cuz don't have user address to subscribe
  useEffect(() => {
    openTzktWebSocket()
      .then((socket) => (ws.current = socket))
      .catch((e) => console.error(e))

    return () => {
      ws?.current?.stop()
      isRunnedInitialConnect.current = false
    }
  }, [])

  /**
   * @userAddress -> address of the user need for tzkt normalization, cuz it can be subscribed to 1+ user
   * @userTokens -> loaded tokens from tztk
   */
  const updateUserTzktTokenBalances = useCallback(
    (userAddress: string) => (userTokens: UserTzktTokensBalancesType) => {
      const normalizedTzktUserTokens = normalizeUserTzktTokensBalances({
        indexerData: userTokens,
        userAddress,
        tokensMetadata,
      })
      setUserCtxState((prev) => ({
        ...prev,
        userTokensBalances: {
          ...prev.userTokensBalances,
          ...normalizedTzktUserTokens,
        },
      }))
    },
    [tokensMetadata],
  )

  const loadInitialTzktTokensForNewlyConnectedUser = useCallback(
    async ({ userAddress, useLoader = true }: { userAddress: string; useLoader?: boolean }) => {
      if (useLoader) setIsTzktBalancesLoading(true)

      setUserCtxState((prev) => ({
        ...prev,
        userAddress,
      }))

      const fetchedTokens = await fetchTzktUserBalances({
        userAddress,
        tokensMetadata,
      })

      setUserCtxState((prev) => ({
        ...prev,
        userTokensBalances: {
          ...fetchedTokens,
        },
      }))

      if (useLoader) setIsTzktBalancesLoading(false)
    },
    [tokensMetadata],
  )

  // handle tzkt socket close or reconnecting events
  const handleDisconnect = useCallback((error?: Error) => {
    if (error) {
      console.error('tzkt socket disconnected: ', { error })
      bug('Connection to TZKT has been lost, try to reload page', 'TZKT connection')
    }
  }, [])

  // handle tzkt socket reconnected event, need to update all tzkt tokens, cuz balances might have changed
  const handleOnReconnected = useCallback(
    async (userAddress: string) => {
      success('Connection to TZKT has been resumed', 'TZKT connection')
      await sleep(500)
      const loadingToasterId = loading('Updating balances of TZKT tokens...', 'TZKT connection')
      await loadInitialTzktTokensForNewlyConnectedUser({ userAddress })
      await sleep(500)
      hideToasterMessage(loadingToasterId)
      success('TZKT tokens baalnces has been updated', 'TZKT connection')
    },
    [loadInitialTzktTokensForNewlyConnectedUser],
  )

  // connect user's wallet to DAPP
  const connect = useCallback(async () => {
    try {
      const userAddress = await DAPP_INSTANCE.connectAccount()

      // if choosen wallet in popup set it to context and loan initial balances from tzkt via fetch
      if (userAddress) {
        loadInitialTzktTokensForNewlyConnectedUser({ userAddress })

        dispatch({ type: SET_REDUX_USER, accountPkh: userAddress })

        if (ws.current) {
          attachTzktSocketsEventHandlers({
            userAddress,
            handleTokens: updateUserTzktTokenBalances(userAddress),
            tzktSocket: ws.current,
            handleDisconnect,
            handleOnReconnected,
          })
        }
      } else {
        info('No account choosen', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
      }
    } catch (e) {
      console.error(`Failed to connect wallet:`, e)
      bug('Failed to connect wallet', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    }
  }, [updateUserTzktTokenBalances, loadInitialTzktTokensForNewlyConnectedUser, handleDisconnect, handleOnReconnected])

  // effect to perform resotring user from localStorage
  useEffect(() => {
    if (canStartUserInitialLoading) connect()
  }, [canStartUserInitialLoading, , connect])

  // subscribe to user's indexer data
  const { loading: userDataLoading } = useSubscription(SUBSCRIBE_USER_DATA, {
    skip: !userCtxState.userAddress,
    variables: {
      userAddress: userCtxState.userAddress,
    },
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      // if user does not exists, TODO: should not be an option
      if (!data || data.mavryk_user.length === 0) {
        bug('User does not exists in DB')
        signOut()
        return
      }

      const { tokensBalances, availableLoansRewards, userMTokens } = normalizeUserIndexerTokensBalances({
        indexerData: data,
        tokensMetadata,
      })

      const normalizedUserData = normalizeUser({ indexerData: data })
      setUserCtxState((prev) => ({
        ...prev,
        userTokensBalances: {
          ...prev.userTokensBalances,
          ...tokensBalances,
        },
        ...normalizedUserData,
        availableLoansRewards,
        userMTokens,
      }))
    },
    onError: (e) => {
      console.error(`UserProvider query error: `, e)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
  })

  /**
   * User farm rewards depends on current indexed level, and every time level updates we need to recalc farm rewards
   * to reduce amount of needed rerenders, we recalc farm rewards every 3rd level change
   *
   * Subscribe to level change only when user's wallet is connected and he has farms where he has deposited
   */
  useSubscription(SUBSCRIPTION_INDEXER_LVL, {
    skip: !userCtxState.userAddress && Object.keys(userCtxState.farmAccounts).length > 0,
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return
      const indexerLvl = data.dipdup_head.find(({ name }) => name === process.env.REACT_APP_RPC_TZKT_API)?.level
      if (indexerLvl) {
        if (indexerLvl - lastSavedLevel.current >= 3) {
          setUserCtxState((prev) => ({
            ...prev,
            availableFarmRewards: getUsersFarmRewards({
              userFarmsRewardsDataFromIndexer: userCtxState.farmAccounts,
              currentLvl: indexerLvl,
            }),
          }))
        }
        lastSavedLevel.current = indexerLvl
      }
    },
    onError: (e) => {
      console.error(`UserProvider query error: `, e)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
  })

  // disconnect user's wallet to DAPP & set default context
  const signOut = useCallback(async () => {
    try {
      await DAPP_INSTANCE.disconnectWallet()

      setUserCtxState(DEFAULT_USER)

      dispatch({ type: DISCONNECT })

      await ws.current?.stop()
      ws.current = null
    } catch (e) {
      console.error(`Failed to disconnect wallet: `, e)
      bug('Failed to disconnect wallet', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    }
  }, [])

  // change user's wallet for DAPP, load new data for him and reopen socket for him
  const changeUser = useCallback(async () => {
    try {
      const newUserAddress = await DAPP_INSTANCE.swapAccount()

      if (newUserAddress && newUserAddress !== userCtxState.userAddress) {
        loadInitialTzktTokensForNewlyConnectedUser({ userAddress: newUserAddress, useLoader: false })

        dispatch({ type: SET_REDUX_USER, accountPkh: newUserAddress })

        await ws.current?.stop()

        const socketInstance = await openTzktWebSocket()
        ws.current = socketInstance

        attachTzktSocketsEventHandlers({
          userAddress: newUserAddress,
          handleTokens: updateUserTzktTokenBalances(newUserAddress),
          tzktSocket: ws.current,
          handleDisconnect,
          handleOnReconnected,
        })
      }
    } catch (e) {
      console.error(`Failed to change wallet: `, e)
      bug('Failed to change wallet', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    }
  }, [
    updateUserTzktTokenBalances,
    loadInitialTzktTokensForNewlyConnectedUser,
    userCtxState.userAddress,
    handleDisconnect,
    handleOnReconnected,
  ])

  const providerValue = useMemo(() => {
    // set initial connect to true, when we have user address set (subs runned and loading statuses set to true) and loading statuses are off,
    // or we don't have user wallet in LC and we are unable to restore it
    if (
      (!isRunnedInitialConnect.current && userCtxState.userAddress && !(userDataLoading || isTzktBalancesLoading)) ||
      !hasUserInLocalStorage
    ) {
      isRunnedInitialConnect.current = true
    }

    return {
      ...userCtxState,
      isLoading: userDataLoading || isTzktBalancesLoading,
      isRunnedInitialConnect: Boolean(isRunnedInitialConnect.current),
      connect,
      signOut,
      changeUser,
    }
  }, [connect, signOut, changeUser, userCtxState])

  return <userContext.Provider value={providerValue}>{children}</userContext.Provider>
}

export const useUserContext = () => {
  const context = useContext(userContext)

  if (!context) {
    throw new Error('userContext should be used withing UserProvider')
  }

  return context
}

export default UserProvider

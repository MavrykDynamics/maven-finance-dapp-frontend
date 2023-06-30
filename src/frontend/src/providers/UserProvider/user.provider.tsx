import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { ApolloError, useSubscription } from '@apollo/client'

// consts
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
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

// queries
import { SUBSCRIBE_USER_DATA } from './queries/userData.query'

// types
import { UserContext, UserContextStateType, UserTzktTokensBalancesType } from './user.provider.types'

export const userContext = React.createContext<UserContext>(undefined!)

type Props = {
  children: React.ReactNode
}

// Instance of Dapp wallet
export const DAPP_INSTANCE = dappClient()
const hasUserInLocalStorage =
  localStorage.getItem('beacon:active-account') && localStorage.getItem('beacon:active-account') !== 'undefined'

// TODO: think about attaching listeners to tzktSocket & test if reopening socket will clear invoke filters
export const UserProvider = ({ children }: Props) => {
  const { tokensMetadata, mTokens } = useTokensContext()
  const { bug, info, success, loading, hideToasterMessage } = useToasterContext()

  const ws = useRef<null | signalR.HubConnection>(null)

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
    }
  }, [])

  /**
   * @userAddress -> address of the user need for tzkt normalization, cuz it can be subscribed to 1+ user
   * @userTokens -> loaded tokens from tztk
   *
   * TODO: check whether reopen tzkt socket will cancel subscription, if yes remove 1st fn with userAddress
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
          ...userCtxState.userTokensBalances,
          ...normalizedTzktUserTokens,
        },
      }))
    },
    [tokensMetadata, userCtxState.userTokensBalances],
  )

  const loadInitialTzktTokensForNewlyConnectedUser = useCallback(
    async ({ userAddress }: { userAddress: string }) => {
      setIsTzktBalancesLoading(true)

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

      setIsTzktBalancesLoading(false)
    },
    [tokensMetadata],
  )

  // connect user's wallet to DAPP
  const connect = useCallback(async () => {
    try {
      const userAddress = await DAPP_INSTANCE.connectAccount()

      // if choosen wallet in popup set it to context and loan initial balances from tzkt via fetch
      if (userAddress) {
        loadInitialTzktTokensForNewlyConnectedUser({ userAddress })

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
  }, [updateUserTzktTokenBalances, loadInitialTzktTokensForNewlyConnectedUser])

  // effect to perform resotring user from localStorage
  useEffect(() => {
    if (canStartUserInitialLoading) {
      isRunnedInitialConnect.current = true
      connect()
    }
  }, [canStartUserInitialLoading, connect])

  // subscribe to user's indexer data
  const { loading: userDataLoading } = useSubscription(SUBSCRIBE_USER_DATA, {
    skip: !userCtxState.userAddress,
    variables: {
      userAddress: userCtxState.userAddress,
    },
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return
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

  // disconnect user's wallet to DAPP & set default context
  const signOut = useCallback(async () => {
    try {
      await DAPP_INSTANCE.disconnectWallet()

      setUserCtxState(DEFAULT_USER)

      await ws.current?.stop()
      ws.current = null
    } catch (e) {
      console.error(`Failed to disconnect wallet: `, e)
      bug('Failed to disconnect wallet', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    }
  }, [])

  // change user's wallet for DAPP, load new data for him and reopen socket for him
  // TODO: check if we need reopen socket, if it will cancel invoke filter then ok, if no just make new invoke
  const changeUser = useCallback(async () => {
    try {
      const newUserAddress = await DAPP_INSTANCE.swapAccount()

      if (newUserAddress && newUserAddress !== userCtxState.userAddress) {
        setUserCtxState(DEFAULT_USER)
        loadInitialTzktTokensForNewlyConnectedUser({ userAddress: newUserAddress })

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
  }, [updateUserTzktTokenBalances, loadInitialTzktTokensForNewlyConnectedUser, userCtxState.userAddress])

  // handle tzkt socket close or reconnecting events
  const handleDisconnect = (error?: Error) => {
    if (error) {
      console.error('tzkt socket disconnected: ', { error })
      bug('Connection to TZKT has been lost, try to reload page', 'TZKT connection')
    }
  }

  // handle tzkt socket reconnected event, need to update all tzkt tokens, cuz balances might have changed
  const handleOnReconnected = async (userAddress: string) => {
    success('Connection to TZKT has been resumed', 'TZKT connection')
    await sleep(500)
    const loadingToasterId = loading('Updating balances of TZKT tokens...', 'TZKT connection')
    await loadInitialTzktTokensForNewlyConnectedUser({ userAddress })
    await sleep(500)
    hideToasterMessage(loadingToasterId)
    success('TZKT tokens baalnces has been updated', 'TZKT connection')
  }

  const providerValue = useMemo(
    () => ({
      ...userCtxState,
      isLoading: userDataLoading || isTzktBalancesLoading,
      connect,
      signOut,
      changeUser,
    }),
    [connect, signOut, changeUser, userCtxState, userDataLoading, isTzktBalancesLoading],
  )

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

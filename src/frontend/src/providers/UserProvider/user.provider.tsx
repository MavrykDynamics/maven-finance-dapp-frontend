import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { ApolloError, useSubscription } from '@apollo/client'

// consts
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { SUBSCRIBE_USER_MVK_SMVK_BALANCE } from './queries/userTokens.query'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'

// helpers

// types
import {
  UserContext,
  UserContextStateType,
  UserMetadataType,
  UserTzktTokensBalancesType,
  UserTzktWSAccountType,
  userTzktTokenBalancesSchema,
  userTzktWSAccountSchema,
} from './user.provider.types'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import {
  fetchTzktUserBalances,
  normalizeUserIndexerTokensBalances,
  normalizeUserTzktTokensBalances,
} from './helpers/userBalances.helpers'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// TODO: remove redux
import { unknownToError } from 'errors/error'
import { XTZ_TOKEN_ADDRESS } from 'utils/constants'
import { SUBSCRIBE_USER_DATA } from './queries/userData.query'
import { normalizeUserMetadata } from './helpers/userMetadata.helpers'
import { dappClient } from 'reducers/wallet/WalletCore'
import { DEFAULT_USER } from './helpers/user.consts'
import { unstable_batchedUpdates } from 'react-dom'
import { object } from 'zod'

export const userContext = React.createContext<UserContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const openTzktWebSocket = async (
  userAddress: string,
  handleTokens: (tokens: UserTzktTokensBalancesType) => void,
): Promise<signalR.HubConnection> => {
  const tzktSocket = new signalR.HubConnectionBuilder()
    .withUrl('https://api.ghostnet.tzkt.io/v1/ws', {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .build()

  // open connection
  await tzktSocket.start()

  // tzktSocket.onreconnecting((error) => {
  //   bug(
  //     'Connection to your token balances has lost, your balances will not be updated, reconnecting...',
  //     'Web Sockets',
  //   )
  //   console.error('user balances socket reconnectig', { error })
  // })

  // tzktSocket.onreconnected(async () => {
  //   success('Connection to your token balances has been resumed, your balances will be updated now...', 'Web Sockets')

  //   if (userCtxState.userAddress) {
  //     const fetchedTokens = await fetchTzktUserBalances({
  //       userAddress: userCtxState.userAddress,
  //       tokensMetadata,
  //       mTokens,
  //     })
  //     updateUserTokenBalances(fetchedTokens)
  //   }
  // })

  // handle tokens balances update message
  tzktSocket.on('token_balances', (msg) => {
    if (!msg.data) return

    try {
      const tokensBalances = userTzktTokenBalancesSchema.parse(msg.data)
      handleTokens(tokensBalances)
    } catch (e) {
      console.error('tzkt tokens balance parse error: ', { e, msg })
    }
  })

  // handle xtz token balance update message
  tzktSocket.on('accounts', (msg) => {
    if (!msg.data) return

    try {
      const [{ balance, address }] = userTzktWSAccountSchema.parse(msg.data)
      handleTokens([
        {
          token: { contract: { address: XTZ_TOKEN_ADDRESS } },
          balance: balance.toString(),
          account: { address },
        },
      ])
    } catch (e) {
      console.error('tzkt xtz token balance parse error: ', { e, msg })
    }
  })

  // subscribe to account's tokens
  tzktSocket.invoke('SubscribeToTokenBalances', {
    account: userAddress,
  })

  // subscribe to account data to get xtz balance ):
  tzktSocket.invoke('SubscribeToAccounts', {
    addresses: [userAddress],
  })

  return tzktSocket
}

// Instance of Dapp wallet
export const DAPP_INSTANCE = dappClient()

export const UserProvider = ({ children }: Props) => {
  const { isLoading: isDappTokensLoading, tokensMetadata, mTokens } = useTokensContext()
  const { bug, success } = useToasterContext()

  const ws = useRef<null | signalR.HubConnection>(null)

  // state for all context provider
  const [userCtxState, setUserCtxState] = useState<UserContextStateType>(DEFAULT_USER)
  const [isTzktBalancesLoading, setIsTzktBalancesLoading] = useState(false)

  const handleSubError = (error: ApolloError | Error) => {
    console.error(`UserProvider query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  const handleTzktTokens = (tokens: UserTzktTokensBalancesType) => {
    const normalizedTzktTokensBalances = normalizeUserTzktTokensBalances({
      indexerData: tokens,
      userAddress: userCtxState.userAddress,
      tokensMetadata,
      dappMTokens: mTokens,
    })
    updateUserTokenBalances(normalizedTzktTokensBalances)
  }

  console.log({ isTzktBalancesLoading, userCtxState })

  // connect user's wallet to DAPP
  const connect = useCallback(async () => {
    try {
      const userAddress = await DAPP_INSTANCE.connectAccount()

      // if choosen wallet in popup
      if (userAddress) {
        setIsTzktBalancesLoading(true)

        const fetchedTokens = await fetchTzktUserBalances({
          userAddress,
          tokensMetadata,
          mTokens,
        })

        console.log({ fetchedTokens, tokensMetadata, mTokens })

        setUserCtxState({
          ...userCtxState,
          userAddress,
          userTokensBalances: {
            ...fetchedTokens,
          },
        })

        setIsTzktBalancesLoading(false)

        const socketInstance = await openTzktWebSocket(userAddress, handleTzktTokens)
        ws.current = socketInstance
      } else {
        bug('No account choosen', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
      }
    } catch (e) {
      console.error(`Failed to connect wallet:`, e)
      bug('Failed to connect wallet', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    }
  }, [tokensMetadata, mTokens])

  console.log({ tokensMetadata })

  // disconnect user's wallet to DAPP
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

  // change user's wallet to DAPP
  const changeUser = useCallback(async () => {
    try {
      const newUserAddress = await DAPP_INSTANCE.swapAccount()

      if (newUserAddress && newUserAddress !== userCtxState.userAddress) {
        setIsTzktBalancesLoading(true)

        const fetchedTokens = await fetchTzktUserBalances({
          userAddress: newUserAddress,
          tokensMetadata,
          mTokens,
        })

        setUserCtxState({
          ...DEFAULT_USER,
          ...userCtxState,
          userAddress: newUserAddress,
          userTokensBalances: {
            ...fetchedTokens,
          },
        })
        setIsTzktBalancesLoading(false)

        await ws.current?.stop()
        const socketInstance = await openTzktWebSocket(newUserAddress, handleTzktTokens)
        ws.current = socketInstance
      }
    } catch (e) {
      console.error(`Failed to change wallet: `, e)
      bug('Failed to change wallet', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    }
  }, [mTokens, tokensMetadata, userCtxState])

  useEffect(() => {
    return () => {
      ws?.current?.stop()
    }
  }, [])

  useEffect(() => {
    if (
      localStorage.getItem('beacon:active-account') &&
      localStorage.getItem('beacon:active-account') !== 'undefined' &&
      !isDappTokensLoading
    )
      connect()
  }, [connect, isDappTokensLoading])

  // subscribe to user's balances for tokens, that can be indexed by indexer
  const { loading: userBalancesFromIndexerLoading } = useSubscription(SUBSCRIBE_USER_MVK_SMVK_BALANCE, {
    skip: !userCtxState.userAddress || isDappTokensLoading,
    variables: {
      userAddress: userCtxState.userAddress,
    },
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      const normalizerUserIndexerTokensBalances = normalizeUserIndexerTokensBalances({
        indexerData: data,
        tokensMetadata,
      })
      updateUserTokenBalances(normalizerUserIndexerTokensBalances)
    },
    onError: handleSubError,
  })

  // subscribe to user's metadata
  const { loading: userDataLoading } = useSubscription(SUBSCRIBE_USER_DATA, {
    skip: !userCtxState.userAddress,
    variables: {
      userAddress: userCtxState.userAddress,
    },
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return
      const normalizedUserMetadata = normalizeUserMetadata({ indexerData: data })
      updateUserMetadata(normalizedUserMetadata)
    },
    onError: handleSubError,
  })

  const updateUserTokenBalances = (newUserTokensBalances: UserContext['userTokensBalances']) => {
    console.log({ userCtxState })
    setUserCtxState({
      ...userCtxState,
      userTokensBalances: {
        ...userCtxState.userTokensBalances,
        ...newUserTokensBalances,
      },
    })
  }

  const updateUserMetadata = (newUserMetadata: UserMetadataType) => {
    setUserCtxState({
      ...userCtxState,
      ...newUserMetadata,
    })
  }

  const providerValue = useMemo(() => {
    return {
      ...userCtxState,
      isLoading: userBalancesFromIndexerLoading || userDataLoading || isTzktBalancesLoading,
      connect,
      signOut,
      changeUser,
    }
  }, [
    connect,
    signOut,
    changeUser,
    userBalancesFromIndexerLoading,
    userCtxState,
    userDataLoading,
    isTzktBalancesLoading,
  ])

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

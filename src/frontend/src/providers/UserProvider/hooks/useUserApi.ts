import { useCallback, useMemo } from 'react'

// providers
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// consts
import { DAPP_INSTANCE } from '../user.provider'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { DEFAULT_USER } from '../helpers/user.consts'

// types
import { UserContextStateType, UserTzKtTokenBalances, UserTzktTokensBalancesType } from '../user.provider.types'

// utils
import { sleep } from 'utils/api/sleep'
import {
  attachTzktSocketsEventHandlers,
  fetchTzktUserBalances,
  normalizeUserTzktTokensBalances,
  openTzktWebSocket,
} from '../helpers/userBalances.helpers'

// TODO: remove after user addres won't be needed in redux actions
import { useDispatch } from 'react-redux'
import { DISCONNECT, SET_REDUX_USER } from 'reducers/wallet'

/**
 * hook to handle CRUD with user (connect, changeWallet, signOut)
 *
 * SHOULD BE USED ONLY IN UserProvider
 */
export const useUserApi = ({
  setUserLoading,
  setIsTzktBalancesLoading,
  setUserCtxState,
  setUserTzktTokens,

  getTzktSocket,
  setTzktSocket,

  userCtxState,
}: {
  // setters for loadings in user provider
  setUserLoading: (newLoading: boolean) => void
  setIsTzktBalancesLoading: (newLoading: boolean) => void

  // setters for user data in user provider
  setUserCtxState: React.Dispatch<React.SetStateAction<UserContextStateType>>
  setUserTzktTokens: React.Dispatch<React.SetStateAction<UserTzKtTokenBalances>>

  // getter & setter for tzkt socket
  getTzktSocket: () => signalR.HubConnection | null
  setTzktSocket: (newTzktSocket: signalR.HubConnection | null) => void

  userCtxState: UserContextStateType
}) => {
  const dispatch = useDispatch()

  const { info, bug, success, loading, hideToasterMessage } = useToasterContext()
  const { tokensMetadata } = useTokensContext()

  const tzktSocket = getTzktSocket()

  /**
   * when user connects wallet or changing wallet we need to load all his tokens from tzkt, cuz ws does not return full tokens, only updated
   */
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

      setUserTzktTokens({
        userAddress,
        tokens: fetchedTokens,
      })

      if (useLoader) setIsTzktBalancesLoading(false)
    },
    [tokensMetadata],
  )

  /**
   * update user's tzkt tokens in userProvider context
   */
  const updateUserTzktTokenBalances = useCallback(
    (userAddress: string) => (userTokens: UserTzktTokensBalancesType) => {
      const normalizedTzktUserTokens = normalizeUserTzktTokensBalances({
        indexerData: userTokens,
        userAddress,
        tokensMetadata,
      })
      setUserTzktTokens((prev) => ({
        ...prev,
        tokens: {
          ...prev.tokens,
          ...normalizedTzktUserTokens,
        },
      }))
    },
    [tokensMetadata],
  )

  /**
   * handle tzkt socket close or reconnecting events
   */
  const handleDisconnect = useCallback((error?: Error) => {
    if (error) {
      console.error('tzkt socket disconnected: ', { error })
      bug('Connection to TZKT has been lost, try to reload page', 'TZKT connection')
    }
  }, [])

  /**
   * handle tzkt socket reconnected event, need to update all tzkt tokens, cuz balances might have changed
   */
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

  /**
   * connect user's wallet to DAPP:
   * load tzkt balances and set user's address to ctx (inside loadInitialTzktTokensForNewlyConnectedUser) to make QueryWithRefetch work
   */
  const connect = useCallback(async () => {
    try {
      const userAddress = await DAPP_INSTANCE.connectAccount()

      if (userAddress) {
        setUserLoading(true)
        loadInitialTzktTokensForNewlyConnectedUser({ userAddress })

        dispatch({ type: SET_REDUX_USER, accountPkh: userAddress })

        if (tzktSocket) {
          attachTzktSocketsEventHandlers({
            userAddress,
            handleTokens: updateUserTzktTokenBalances(userAddress),
            tzktSocket,
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

  /**
   * disconnect user's wallet to DAPP & set context to no user state
   */
  const signOut = useCallback(async () => {
    try {
      await DAPP_INSTANCE.disconnectWallet()

      setUserCtxState(DEFAULT_USER)

      dispatch({ type: DISCONNECT })

      await tzktSocket?.stop()
      setTzktSocket(null)
    } catch (e) {
      console.error(`Failed to disconnect wallet: `, e)
      bug('Failed to disconnect wallet', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    }
  }, [])

  /**
   * change user's wallet for DAPP, load new data for him and reopen socket for him
   */
  const changeUser = useCallback(async () => {
    try {
      const newUserAddress = await DAPP_INSTANCE.swapAccount()

      if (newUserAddress && newUserAddress !== userCtxState.userAddress) {
        setUserLoading(true)
        // TODO: test it
        // on user change set his loans data to null to make loader in useUserLoansData hook correct
        setUserCtxState((prev) => ({ ...DEFAULT_USER, userAddress: prev.userAddress }))

        loadInitialTzktTokensForNewlyConnectedUser({ userAddress: newUserAddress, useLoader: false })

        dispatch({ type: SET_REDUX_USER, accountPkh: newUserAddress })

        await tzktSocket?.stop()

        const newTzktSocket = await openTzktWebSocket()
        setTzktSocket(newTzktSocket)

        attachTzktSocketsEventHandlers({
          userAddress: newUserAddress,
          handleTokens: updateUserTzktTokenBalances(newUserAddress),
          tzktSocket: newTzktSocket,
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

  const returnValue = useMemo(() => ({ connect, changeUser, signOut }), [connect, changeUser, signOut])

  return returnValue
}

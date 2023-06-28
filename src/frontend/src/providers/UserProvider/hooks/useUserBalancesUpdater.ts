import { useSubscription } from '@apollo/client'
import * as signalR from '@microsoft/signalr'
import { useEffect, useRef, useState } from 'react'

// context
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from '../user.provider'

// subs
import { SUBSCRIBE_USER_MVK_SMVK_BALANCE } from '../queries/userTokens.query'

// types
// import {
//   UserTokenBalancesParsedResponce,
//   userTokenBalanceSchema,
//   userTzktAccountSchema,
//   userTzktWSAccountSchema,
// } from '../helpers/user.types'
// import { UserContext } from '../user.provider.types'

// consts
import { MVK_DECIMALS, SMVK_TOKEN_ADDRESS, XTZ_TOKEN_ADDRESS } from 'utils/constants'

// helpers
// import { convertNumberForClient } from 'utils/calcFunctions'
// import { normalizerUserBalances } from '../helpers/userBalances.helpers'
// import { api } from 'utils/api/api'
// import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
// import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

export const useUserBalancesUpdater = (userAddress: string | null, isTokensLoading: boolean) => {
  // const { tokensMetadata, mTokens } = useTokensContext()
  // const { updateUserTokenBalances, userTokensBalances } = useUserContext()
  // const { bug, success } = useToasterContext()

  // const ws = useRef<null | signalR.HubConnection>(null)
  // const prevUserAddress = useRef<null | string>(userAddress)

  // const [isInitialTokenBalancesLoading, setIsInitialTokenBalancesLoading] = useState(false)
  // const [socketBalances, setSocketBalances] = useState<UserTokenBalancesParsedResponce>([])
  //
  // loading user balaces
  // const fetchUserBalances = async () => {
  //   if (!userAddress) return
  //   try {
  //     const [tokens, xtzTokenBalance] = await Promise.all([
  //       api(`https://api.ghostnet.tzkt.io/v1/tokens/balances?account.eq=${userAddress}`, {}, userTokenBalanceSchema),
  //       api(`https://api.ghostnet.tzkt.io/v1/accounts/${userAddress}`, {}, userTzktAccountSchema),
  //     ])

  //     setSocketBalances(
  //       tokens.data.concat([
  //         {
  //           token: { contract: { address: XTZ_TOKEN_ADDRESS } },
  //           balance: xtzTokenBalance.data.balance.toString(),
  //           account: { address: xtzTokenBalance.data.address },
  //         },
  //       ]),
  //     )
  //   } catch (e) {
  //     bug('Error occured while loading your balances, try to reload the page', 'Tokens balances')
  //     console.error('tzkt loading initial balances error: ', e)
  //   } finally {
  //     setIsInitialTokenBalancesLoading(false)
  //   }
  // }

  // // if we don't have balances loaded & tokens metadata is ready, load them via fetch to have all tokens balances
  // useEffect(() => {
  //   if (!userTokensBalances && !isTokensLoading) fetchUserBalances()
  // }, [isTokensLoading])

  // // set up tzkt webSocket to live update user tzkt tokens balances
  // useEffect(() => {
  //   ;(async () => {
  //     try {
  //       const tzktSocket = new signalR.HubConnectionBuilder()
  //         .withUrl('https://api.ghostnet.tzkt.io/v1/ws', {
  //           skipNegotiation: true,
  //           transport: signalR.HttpTransportType.WebSockets,
  //         })
  //         .build()
  //       ws.current = tzktSocket

  //       // open connection
  //       await tzktSocket.start()

  //       tzktSocket.onreconnecting((error) => {
  //         bug(
  //           'Connection to your token balances has lost, your balances will not be updated, reconnecting...',
  //           'Web Sockets',
  //         )
  //         console.error('user balances socket reconnectig', { error })
  //       })

  //       tzktSocket.onreconnected(() => {
  //         success(
  //           'Connection to your token balances has been resumed, your balances will be updated now...',
  //           'Web Sockets',
  //         )
  //         fetchUserBalances()
  //       })
  //     } catch (e) {
  //       bug("DAPP can't connect to your user, try to reload page...", 'Web Sockets')
  //       console.error('user balances socket reconnectig', { e })
  //     }
  //   })()

  //   return () => {
  //     ws?.current?.stop()
  //   }
  // }, [])

  // useEffect(() => {
  //   // if user has changed account we need to reset all balances, and load them again, also need to update socket for new user
  //   if (userAddress !== prevUserAddress.current) {
  //     updateUserTokenBalances(null)
  //     fetchUserBalances()

  //     // also on user account change we need to change subscribtion on socket
  //     if (ws.current && userAddress) {
  //       // handle tokens balances update message
  //       ws.current.on('token_balances', (msg) => {
  //         if (!msg.data) return

  //         setSocketBalances(msg.data)
  //       })

  //       // handle xtz token balance update message
  //       ws.current.on('accounts', (msg) => {
  //         if (!msg.data) return

  //         try {
  //           const [{ balance, address }] = userTzktWSAccountSchema.parse(msg.data)
  //           setSocketBalances([
  //             {
  //               token: { contract: { address: XTZ_TOKEN_ADDRESS } },
  //               balance: balance.toString(),
  //               account: { address },
  //             },
  //           ])
  //         } catch (e) {
  //           console.error('tzkt xtz token balance parse error: ', { e, msg })
  //         }
  //       })

  //       /**
  //        * TODO: need to cancel prev invoke filters and update it with new account address, couldn't find it in docs,
  //        * so in balances normalizer we check also token owner address, to not update context with not current user token
  //        */

  //       // subscribe to account token balances
  //       ws.current.invoke('SubscribeToTokenBalances', {
  //         account: userAddress,
  //       })

  //       // subscribe to account data to get xtz balance ):
  //       ws.current.invoke('SubscribeToAccounts', {
  //         addresses: [userAddress],
  //       })
  //     }
  //   }

  //   prevUserAddress.current = userAddress
  // }, [userAddress])

  /**
   * effect to normalize and update context with user token balances from tzkt
   */
  // useEffect(() => {
  //   if (!socketBalances || !socketBalances.length) return
  //   try {
  //     const tokensData = userTokenBalanceSchema.parse(socketBalances)

  //     const normalizedTokensBalances = normalizerUserBalances(tokensData, tokensMetadata, mTokens, userAddress)

  //     updateUserTokenBalances(normalizedTokensBalances)
  //   } catch (e) {
  //     console.error('tzkt tokens balances parse error: ', e, socketBalances)
  //   } finally {
  //     setSocketBalances([])
  //   }
  // }, [mTokens, socketBalances, tokensMetadata, userAddress])

  // const { loading: userBalancesFromIndexerLoading } = useSubscription(SUBSCRIBE_USER_MVK_SMVK_BALANCE, {
  //   skip: !userAddress || isTokensLoading,
  //   variables: {
  //     userAddress: userAddress,
  //   },
  //   shouldResubscribe: true,
  //   onData: ({ data: response }) => {
  //     const { data } = response
  //     if (!data) return

  //     const { smvk_balance, mvk_balance, mvk_transfer_receiver, mvk_transfer_sender, m_token_accounts } =
  //       data.mavryk_user[0]

  //     // TODO: find a way to 100% have mvk token address here
  //     const mvkTokenAddress = mvk_transfer_receiver[0]?.mvk_token.address ?? mvk_transfer_sender[0]?.mvk_token.address

  //     const mTokenBalances = m_token_accounts.reduce<NonNullable<UserContext['userTokensBalances']>>(
  //       (acc, { balance, m_token: { address } }) => {
  //         const mToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: address })

  //         if (!mToken) return acc

  //         const { decimals } = mToken

  //         // TODO: should mToken balance include rewards?
  //         acc[address] = convertNumberForClient({ number: balance, grade: decimals })

  //         return acc
  //       },
  //       {},
  //     )

  //     updateUserTokenBalances({
  //       ...(mvkTokenAddress
  //         ? { [mvkTokenAddress]: convertNumberForClient({ number: mvk_balance, grade: MVK_DECIMALS }) }
  //         : {}),
  //       [SMVK_TOKEN_ADDRESS]: convertNumberForClient({ number: smvk_balance, grade: MVK_DECIMALS }),
  //       ...mTokenBalances,
  //     })
  //   },
  //   onError: (error) => {
  //     bug('Please reload page', 'Web Sockets')
  //     console.error('SUBSCRIBE_USER_MVK_SMVK_BALANCE error: ', { error })
  //   },
  // })

  return { isLoading: false }
}

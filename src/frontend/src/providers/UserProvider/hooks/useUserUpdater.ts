import { useSubscription } from '@apollo/client'
import * as signalR from '@microsoft/signalr'

import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// subs
import { useEffect, useRef, useState } from 'react'
import { SUB_SUBSCRIBE, SUB_SKIP, SUB_QUERY } from 'utils/api/apollo.consts'
import {
  UserSubscriptionSkipsType,
  UserTokenBalancesParsedResponce,
  userTokenBalanceSchema,
  userTzktAccountSchema,
  userTzktWSAccountSchema,
} from '../helpers/user.types'
import { useUserContext } from '../user.provider'
// import { getUserBalances } from '../helpers/getUserBalances'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { SUBSCRIBE_USER_MVK_SMVK_BALANCE } from '../queries/userTokens.query'
import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS, SMVK_TOKEN_ADDRESS, XTZ_TOKEN_ADDRESS } from 'utils/constants'
import { UserContext } from '../user.provider.types'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { normalizerUserBalances } from '../helpers/userBalances.helpers'
import { api } from 'utils/api/api'
import { z } from 'zod'

export const useUserUpdater = (
  { skipUserBalancesUpdate }: UserSubscriptionSkipsType = { skipUserBalancesUpdate: SUB_SUBSCRIBE },
) => {
  const ws = useRef<null | signalR.HubConnection>(null)

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { tokensMetadata, mTokens } = useTokensContext()
  const { updateUserTokenBalances, userTokensBalances } = useUserContext()

  const [shouldSkip, setShouldSkip] = useState<UserSubscriptionSkipsType>({ skipUserBalancesUpdate })
  const [isInitialTokenBalancesLoading, setIsInitialTokenBalancesLoading] = useState(userTokensBalances === null)
  const [socketBalances, setSocketBalances] = useState<UserTokenBalancesParsedResponce>([])

  /**
   * set up subscibe to user account tokens, and set it to the state after it's received
   * TODO: handle user change
   */
  useEffect(() => {
    if (!accountPkh) return
    ;(async () => {
      // if we haven't loaded token balances, load it by fetch
      if (isInitialTokenBalancesLoading) {
        try {
          const [tokens, xtzTokenBalance] = await Promise.all([
            api(`https://api.ghostnet.tzkt.io/v1/tokens/balances?account.eq=${accountPkh}`, {}, userTokenBalanceSchema),
            api(`https://api.ghostnet.tzkt.io/v1/accounts/${accountPkh}`, {}, userTzktAccountSchema),
          ])

          setSocketBalances(
            tokens.data.concat([
              { token: { contract: { address: XTZ_TOKEN_ADDRESS } }, balance: xtzTokenBalance.data.balance.toString() },
            ]),
          )
        } catch (e) {
          console.error('tzkt loading initial balances error: ', e)
        } finally {
          setIsInitialTokenBalancesLoading(false)
        }
      }

      // if we have loaded token balances, open socket to observe token balances on tzkt
      if (!isInitialTokenBalancesLoading && !ws.current) {
        const tzktSocket = new signalR.HubConnectionBuilder().withUrl('https://api.ghostnet.tzkt.io/v1/ws').build()
        ws.current = tzktSocket

        // open connection
        await tzktSocket.start()

        // handle tokens balances update message
        tzktSocket.on('token_balances', (msg) => {
          if (!msg.data) {
            console.log(`%c message received`, 'color: #bada55', msg)
            return
          }

          console.log(`%c tokens balances message`, 'color: #cf63c2', msg)
          setSocketBalances(msg.data)
        })

        // subscribe to account token balances
        await tzktSocket.invoke('SubscribeToTokenBalances', {
          account: accountPkh,
        })

        // handle xtz token balance update message
        tzktSocket.on('accounts', (msg) => {
          if (!msg.data) {
            console.log(`%c message received`, 'color: #bada55', msg)
            return
          }

          console.log(`%c tokens balances XTZ message`, 'color: #b89000', msg)

          try {
            const [{ balance }] = userTzktWSAccountSchema.parse(msg.data)

            setSocketBalances([{ token: { contract: { address: XTZ_TOKEN_ADDRESS } }, balance: balance.toString() }])
          } catch (e) {
            console.error('tzkt token balance parse error: ', e)
          }
        })

        // subscribe to account data to get xtz balance ):
        await tzktSocket.invoke('SubscribeToAccounts', {
          addresses: [accountPkh],
        })
      }
    })()

    return () => {
      ws?.current?.stop()
    }
  }, [accountPkh, isInitialTokenBalancesLoading])

  /**
   * effect to normalize and update context with user token balances from tzkt
   */
  useEffect(() => {
    if (!socketBalances) return
    try {
      const tokensData = userTokenBalanceSchema.parse(socketBalances)

      const normalizedTokensBalances = normalizerUserBalances(tokensData, tokensMetadata, mTokens)

      console.log({ tokensData, normalizedTokensBalances })
      updateUserTokenBalances(normalizedTokensBalances)
    } catch (e) {
      console.error('tzkt token balance parse error: ', e, socketBalances)
    }
  }, [mTokens, socketBalances, tokensMetadata, updateUserTokenBalances])

  const { loading: userBalancesFromIndexerLoading } = useSubscription(SUBSCRIBE_USER_MVK_SMVK_BALANCE, {
    skip: shouldSkip.skipUserBalancesUpdate === SUB_SKIP || !accountPkh,
    variables: {
      userAddress: accountPkh,
    },
    shouldResubscribe: true,
    onData: ({ data: response }) => {
      const { data } = response
      if (!data) return

      const { smvk_balance, mvk_balance, mvk_transfer_receiver, mvk_transfer_sender, m_token_accounts } =
        data.mavryk_user[0]

      // TODO: find a way to 100% have mvk token address here
      const mvkTokenAddress = mvk_transfer_receiver[0]?.mvk_token.address ?? mvk_transfer_sender[0]?.mvk_token.address

      // TODO: do i need mToken balances here?
      const mTokenBalances = m_token_accounts.reduce<NonNullable<UserContext['userTokensBalances']>>(
        (acc, { balance, m_token: { address } }) => {
          const mToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: address })

          if (!mToken) return acc

          const { decimals } = mToken

          acc[address] = convertNumberForClient({ number: balance, grade: decimals })

          return acc
        },
        {},
      )

      updateUserTokenBalances({
        ...(mvkTokenAddress
          ? { [mvkTokenAddress]: convertNumberForClient({ number: mvk_balance, grade: MVK_DECIMALS }) }
          : {}),
        [SMVK_TOKEN_ADDRESS]: convertNumberForClient({ number: smvk_balance, grade: MVK_DECIMALS }),
        ...mTokenBalances,
      })
    },
    onError: (error) => {
      console.log({ error })
    },
  })

  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription si only for initial loading
  useEffect(() => {
    if (skipUserBalancesUpdate === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipTokensMetadataSubscription: SUB_SKIP,
      }))
    }
  }, [skipUserBalancesUpdate])

  return { isLoading: isInitialTokenBalancesLoading || userBalancesFromIndexerLoading }
}

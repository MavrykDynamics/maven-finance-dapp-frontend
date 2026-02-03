import * as signalR from '@microsoft/signalr'

// types
import { UserContext, UserTzktTokensBalancesType } from './../user.provider.types'
import { GetUserDataQuery } from 'utils/__generated__/graphql'
import { TokenAddressType, TokensContext, UserMTokenType } from 'providers/TokensProvider/tokens.provider.types'

// helpers
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { api } from 'utils/api/api'
import { convertNumberForClient } from 'utils/calcFunctions'
import { ApiError, unknownToError } from 'errors/error'
import {
  emptyUserTzktAccountSchema,
  userTzktAccountSchema,
  userTzktTokenBalancesSchema,
  userTzktWSAccountSchema,
} from './user.schemes'

// consts
import { MVN_DECIMALS, SMVN_TOKEN_ADDRESS, MVRK_TOKEN_ADDRESS } from 'utils/constants'
import { mTokenMetadataSchema } from 'providers/TokensProvider/helpers/tokens.schemes'

/**
 * function to get token balance of the user
 */
export const getUserTokenBalanceByAddress = ({
  userTokensBalances,
  tokenAddress,
}: {
  userTokensBalances: UserContext['userTokensBalances']
  tokenAddress?: string | null
}): number => {
  if (!userTokensBalances || !tokenAddress) return 0
  return userTokensBalances[tokenAddress] ?? 0
}

/**
 * nomalize user tokens fetched from tzkt, they have different structure from indexer ones
 */
export const normalizeUserTzktTokensBalances = ({
  userAddress,
  indexerData,
  tokensMetadata,
}: {
  indexerData: UserTzktTokensBalancesType
  tokensMetadata: TokensContext['tokensMetadata']
  userAddress: string | null
}) => {
  return indexerData.reduce<NonNullable<UserContext['userTokensBalances']>>(
    (
      acc,
      {
        balance,
        token: {
          contract: { address: tokenAddress },
        },
        account: { address },
      },
    ) => {
      const token = getTokenDataByAddress({ tokenAddress, tokensMetadata })

      if (!token || userAddress !== address) return acc
      const { decimals } = token

      acc[tokenAddress] = convertNumberForClient({ number: parseFloat(balance), grade: decimals })
      return acc
    },
    {},
  )
}

/**
 * normalize user tokens from indexer (mTokens, mvn, smvn)
 */
export const normalizeUserIndexerTokensBalances = ({
  indexerData,
  tokensMetadata,
  mvnTokenAddress,
}: {
  indexerData: GetUserDataQuery
  tokensMetadata: TokensContext['tokensMetadata']
  mvnTokenAddress: string | null
}) => {
  const { smvn_balance, mvn_balance, m_token_accounts } = indexerData.maven_user[0]

  const { mTokenBalances, userMTokens, availableLoansRewards } = m_token_accounts.reduce<{
    mTokenBalances: NonNullable<UserContext['userTokensBalances']>
    userMTokens: Record<TokenAddressType, UserMTokenType>
    availableLoansRewards: 0
  }>(
    (acc, { balance, rewards_earned, m_token: { address, metadata } }) => {
      try {
        const {
          assets: [{ decimals: interestRateDecimals }],
        } = mTokenMetadataSchema.parse(metadata)

        const mToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: address })
        if (!mToken) throw new Error(`token is not whitelisted for DAPP: ${{ address }}`)

        const mTokenBalance = convertNumberForClient({ number: balance, grade: mToken.decimals })
        const mTokenInterestEarned = convertNumberForClient({
          number: rewards_earned,
          grade: +interestRateDecimals,
        })

        acc.mTokenBalances[address] = mTokenBalance
        acc.userMTokens[address] = {
          lendValue: mTokenBalance,
          interestEarned: mTokenInterestEarned,
        }
        acc.availableLoansRewards += mTokenInterestEarned
      } catch (e) {
        if (import.meta.env.VITE_ENV === 'prod') console.error('normalize user mTokens error: ', { e })
      } finally {
        return acc
      }
    },
    { mTokenBalances: {}, userMTokens: {}, availableLoansRewards: 0 },
  )

  return {
    tokensBalances: {
      ...(mvnTokenAddress
        ? { [mvnTokenAddress]: convertNumberForClient({ number: mvn_balance, grade: MVN_DECIMALS }) }
        : {}),
      [SMVN_TOKEN_ADDRESS]: convertNumberForClient({ number: smvn_balance, grade: MVN_DECIMALS }),
      ...mTokenBalances,
    },
    userMTokens,
    availableLoansRewards,
  }
}

/**
 * load tokens from tzkt api for user, for xtz we need to load user tzkt profile
 *
 * we can get 2 cases here
 *
 * 1. user don't exist, it will return emptyUserTzktAccountSchema response and userTzktTokenBalancesSchema will we just [], so we'll return empty object, no tokens means on tzkt
 * 2. user exists, it will return userTzktAccountSchema with xtz balance data, and userTzktTokenBalancesSchema array of all other tokens, we will normalize them and return
 */
export const fetchTzktUserBalances = async ({
  userAddress,
  tokensMetadata,
}: {
  tokensMetadata: TokensContext['tokensMetadata']
  userAddress: string
}) => {
  try {
    const [{ data: tokensData }, { data: accountData }] = await Promise.all([
      api(`${import.meta.env.VITE_TZKT_API}/v1/tokens/balances?account.eq=${userAddress}`),
      api(`${import.meta.env.VITE_TZKT_API}/v1/accounts/${userAddress}`),
    ])

    const isUserEmptyOnTzkt = emptyUserTzktAccountSchema.safeParse(accountData)

    if (isUserEmptyOnTzkt.success) return {}

    const parsedUserTzktTokensData = userTzktTokenBalancesSchema.safeParse(tokensData)
    const parsedUserMvrkTokenBalance = userTzktAccountSchema.safeParse(accountData)

    if (parsedUserTzktTokensData.success && parsedUserMvrkTokenBalance.success) {
      return normalizeUserTzktTokensBalances({
        indexerData: parsedUserTzktTokensData.data.concat([
          {
            token: { contract: { address: MVRK_TOKEN_ADDRESS } },
            balance: parsedUserMvrkTokenBalance.data.balance.toString(),
            account: { address: parsedUserMvrkTokenBalance.data.address },
          },
        ]),
        userAddress,
        tokensMetadata,
      })
    }

    throw new Error('Error occured while loading your balances, try to reload the page, or change user')
  } catch (e) {
    const convertedError = unknownToError(e)
    throw new ApiError(convertedError)
  }
}

// -------- TZKT sockets handlers --------
/**
 * opens websocket connection to tzkt, via signalR library
 * @returns opened socket instance
 */
export const openTzktWebSocket = async (): Promise<signalR.HubConnection> => {
  try {
    const tzktSocket = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_TZKT_API}/v1/ws`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build()

    // open connection
    await tzktSocket
      .start()
      .then(() => {})
      .catch((err) => console.error('WebSocket error:', err))

    return tzktSocket
  } catch (e) {
    throw new ApiError("Couldn't open tzkt socket connection")
  }
}

/**
 * subscribe to current user on tzkt websocket
 */
export const attachTzktSocketsEventHandlers = ({
  userAddress,
  handleTokens,
  tzktSocket,
  handleDisconnect,
  handleOnReconnected,
}: {
  userAddress: string
  handleTokens: (tokens: UserTzktTokensBalancesType) => void
  tzktSocket: signalR.HubConnection
  handleDisconnect: (error?: Error) => void
  handleOnReconnected: (userAddress: string) => void
}) => {
  tzktSocket.on('token_balances', (msg) => {
    if (!msg.data) return

    try {
      const tokensBalances = userTzktTokenBalancesSchema.parse(msg.data)
      handleTokens(tokensBalances)
    } catch (e) {
      if (import.meta.env.VITE_ENV === 'prod') console.error('tzkt tokens balance parse error: ', { e, msg })
    }
  })

  // handle xtz token balance update message
  tzktSocket.on('accounts', (msg) => {
    if (!msg.data) return

    try {
      const [{ balance, address }] = userTzktWSAccountSchema.parse(msg.data)
      handleTokens([
        {
          token: { contract: { address: MVRK_TOKEN_ADDRESS } },
          balance: balance.toString(),
          account: { address },
        },
      ])
    } catch (e) {
      if (import.meta.env.VITE_ENV === 'prod') console.error('tzkt xtz token balance parse error: ', { e, msg })
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

  tzktSocket.onclose(handleDisconnect)
  tzktSocket.onreconnecting(handleDisconnect)
  tzktSocket.onreconnected(() => handleOnReconnected(userAddress))
}

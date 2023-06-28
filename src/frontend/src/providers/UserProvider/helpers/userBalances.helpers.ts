import {
  UserContext,
  UserTzktTokensBalancesType,
  userTzktAccountSchema,
  userTzktTokenBalancesSchema,
} from './../user.provider.types'
import { GetUserMvkSmvkBalanceSubscription } from 'utils/__generated__/graphql'
import { TokenAddressType, TokensContext } from 'providers/TokensProvider/tokens.provider.types'

import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS, SMVK_TOKEN_ADDRESS, XTZ_TOKEN_ADDRESS } from 'utils/constants'
import { api } from 'utils/api/api'
import { ApiError } from 'errors/error'

export const getUserTokenBalanceByAddress = ({
  userTokensBalances,
  tokenAddress,
}: {
  userTokensBalances: UserContext['userTokensBalances']
  tokenAddress?: string
}): number => {
  if (!userTokensBalances || !tokenAddress) return 0
  return userTokensBalances[tokenAddress] ?? 0
}

export const normalizeUserTzktTokensBalances = ({
  userAddress,
  dappMTokens,
  indexerData,
  tokensMetadata,
}: {
  indexerData: UserTzktTokensBalancesType
  tokensMetadata: TokensContext['tokensMetadata']
  userAddress: string | null
  dappMTokens: TokensContext['mTokens']
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

      console.log({ token, tokenAddress })

      if (!token || dappMTokens.includes(tokenAddress) || userAddress !== address) return acc
      const { decimals } = token

      acc[tokenAddress] = convertNumberForClient({ number: parseFloat(balance), grade: decimals })
      return acc
    },
    {},
  )
}

export const normalizeUserIndexerTokensBalances = ({
  indexerData,
  tokensMetadata,
}: {
  indexerData: GetUserMvkSmvkBalanceSubscription
  tokensMetadata: TokensContext['tokensMetadata']
}): Record<TokenAddressType, number> => {
  const { smvk_balance, mvk_balance, mvk_transfer_receiver, mvk_transfer_sender, m_token_accounts } =
    indexerData.mavryk_user[0]

  // TODO: find a way to 100% have mvk token address here
  const mvkTokenAddress = mvk_transfer_receiver[0]?.mvk_token.address ?? mvk_transfer_sender[0]?.mvk_token.address

  const mTokenBalances = m_token_accounts.reduce<NonNullable<UserContext['userTokensBalances']>>(
    (acc, { balance, m_token: { address } }) => {
      const mToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: address })

      if (!mToken) return acc

      const { decimals } = mToken

      // TODO: should mToken balance include rewards?
      acc[address] = convertNumberForClient({ number: balance, grade: decimals })

      return acc
    },
    {},
  )

  return {
    ...(mvkTokenAddress
      ? { [mvkTokenAddress]: convertNumberForClient({ number: mvk_balance, grade: MVK_DECIMALS }) }
      : {}),
    [SMVK_TOKEN_ADDRESS]: convertNumberForClient({ number: smvk_balance, grade: MVK_DECIMALS }),
    ...mTokenBalances,
  }
}

export const fetchTzktUserBalances = async ({
  userAddress,
  mTokens,
  tokensMetadata,
}: {
  tokensMetadata: TokensContext['tokensMetadata']
  userAddress: string
  mTokens: TokensContext['mTokens']
}) => {
  try {
    const [{ data: tokensData }, { data: xtxData }] = await Promise.all([
      api(`https://api.ghostnet.tzkt.io/v1/tokens/balances?account.eq=${userAddress}`, {}, userTzktTokenBalancesSchema),
      api(`https://api.ghostnet.tzkt.io/v1/accounts/${userAddress}`, {}, userTzktAccountSchema),
    ])

    const normalizedTzktTokensBalances = normalizeUserTzktTokensBalances({
      indexerData: tokensData.concat([
        {
          token: { contract: { address: XTZ_TOKEN_ADDRESS } },
          balance: xtxData.balance.toString(),
          account: { address: xtxData.address },
        },
      ]),
      userAddress,
      tokensMetadata,
      dappMTokens: mTokens,
    })

    return normalizedTzktTokensBalances
  } catch (e) {
    console.error(`fetchTzktUserBalances query error: `, e)
    throw new ApiError('Error occured while loading your balances, try to reload the page')
  }
}

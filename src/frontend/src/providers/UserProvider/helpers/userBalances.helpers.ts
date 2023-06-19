import { UserContext } from './../user.provider.types'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { UserTokenBalancesParsedResponce } from './user.types'

import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

export const normalizerUserBalances = (
  tokensData: UserTokenBalancesParsedResponce,
  tokensMetadata: TokensContext['tokensMetadata'],
  dappMTokens: TokensContext['mTokens'],
) => {
  return tokensData.reduce<NonNullable<UserContext['userTokensBalances']>>(
    (
      acc,
      {
        balance,
        token: {
          contract: { address: tokenAddress },
        },
      },
    ) => {
      const token = getTokenDataByAddress({ tokenAddress, tokensMetadata })

      if (!token || dappMTokens.includes(tokenAddress)) return acc
      const { decimals } = token

      acc[tokenAddress] = convertNumberForClient({ number: parseFloat(balance), grade: decimals })
      return acc
    },
    {},
  )
}

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

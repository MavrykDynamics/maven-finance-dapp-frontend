import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenSymbolAndName } from './tokenNames'
import { isValidTokenType } from 'utils/TypesAndInterfaces/General'

import { TokenAddress, TokenMetadata, TokensContext } from '../tokens.provider.types'
import { SubsribeOracleDataFeedSubscription, TokensMetadataSubscription } from 'utils/__generated__/graphql'
import { tokenMetadataSchema } from '../helpers/tokens.types'

// Normalizing token rates
export const normalizeTokenPrices = (feedsLedger: SubsribeOracleDataFeedSubscription['aggregator']) => {
  return feedsLedger.reduce<Record<string, number>>((acc, feed) => {
    const { symbol } = getTokenSymbolAndName(feed.name) ?? {}

    if (symbol) {
      acc[symbol] = convertNumberForClient({ number: feed.last_completed_data, grade: feed.decimals })
    }
    return acc
  }, {})
}

// Normalizing tokens metadata
export const normalizeTokensMetadata = (tokensFromGql: TokensMetadataSubscription['token']) => {
  return tokensFromGql.reduce<Pick<TokensContext, 'tokensMetadata' | 'collateralTokens' | 'mTokens'>>(
    (acc, { token_address, token_standard, metadata, lending_controller_collateral_tokens, m_tokens, mvk_tokens }) => {
      const tokenAddress: TokenAddress = token_address

      try {
        // Validating token type, it should be one of tez | fa2 | fa12
        const tokenType = isValidTokenType(token_standard) ? token_standard : null
        if (!tokenType) {
          throw new Error('Token is invalid token type, not in range tez | fa2 | fa12')
        }

        // parsing metadata schema, to have icon and decimals for token
        const parsedMetadata = tokenMetadataSchema.parse(metadata)

        const { symbol, name, icon } = getTokenSymbolAndName(parsedMetadata.symbol) ?? {}

        const tokenIcon = parsedMetadata.icon ?? icon
        // If token don't have name or symbol or icon it can not be used
        if (!symbol || !name || !tokenIcon) {
          throw new Error('Token do not have valid symbol, name or icon')
        }

        // We can have multiple mvk tokens, but only 1 with mvk_tokens present is valid
        if (symbol === 'MVK' && !mvk_tokens?.[0]?.address) return acc

        const tokenMetadata: TokenMetadata = {
          address: tokenAddress,
          symbol,
          name,
          icon: tokenIcon,
          type: tokenType,
          decimals: Number(parsedMetadata.decimals),
        }

        acc.tokensMetadata[tokenAddress] = tokenMetadata

        if (lending_controller_collateral_tokens?.[0]?.token_name) acc.collateralTokens.push(tokenAddress)

        if (m_tokens?.[0]?.address) acc.mTokens.push(tokenAddress)
      } catch (e) {
        console.error('normalizeTokensMetadata error: ', { e })
      } finally {
        return acc
      }
    },
    { tokensMetadata: {}, collateralTokens: [], mTokens: [] },
  )
}

import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenSymbolAndName } from '../hooks/tokenNames'
import { isValidTokenType } from 'utils/TypesAndInterfaces/General'

import { TokenAddressType, TokenMetadataType, TokensContext } from '../tokens.provider.types'
import { SubsribeOracleDataFeedSubscription, TokensMetadataSubscription } from 'utils/__generated__/graphql'
import { tokenMetadataSchema } from './tokens.types'

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
    (
      acc,
      {
        token_id,
        token_address,
        token_standard,
        metadata,
        lending_controller_collateral_tokens,
        lending_controller_loan_tokens,
        m_tokens,
        mvk_tokens,
      },
    ) => {
      const tokenAddress: TokenAddressType = token_address

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
          throw new Error(`Token do not have valid symbol, name or icon ${symbol}, ${name}, ${tokenIcon}`)
        }

        // We can have multiple mvk tokens, but only 1 with mvk_tokens present is valid
        if (symbol === 'MVK' && !mvk_tokens?.[0]?.address) return acc

        const tokenMetadata: TokenMetadataType = {
          id: token_id,
          address: tokenAddress,
          symbol,
          name,
          icon: tokenIcon,
          type: tokenType,
          decimals: Number(parsedMetadata.decimals),
        }

        // if token is collateral
        if (lending_controller_collateral_tokens?.[0]) {
          acc.collateralTokens.push(tokenAddress)
          tokenMetadata.loanData = {
            indexerName: lending_controller_collateral_tokens[0].token_name,
            isProtectedCollateral: lending_controller_collateral_tokens[0].protected,
          }
        }

        // if token is loan token
        if (lending_controller_loan_tokens?.[0]) {
          tokenMetadata.loanData = {
            indexerName: lending_controller_loan_tokens[0].loan_token_name,
          }
        }

        // if token is mToken
        if (m_tokens?.[0]?.address) acc.mTokens.push(tokenAddress)

        acc.tokensMetadata[tokenAddress] = tokenMetadata
      } catch (e) {
        console.error('normalizeTokensMetadata error: ', { e })
      } finally {
        return acc
      }
    },
    { tokensMetadata: {}, collateralTokens: [], mTokens: [] },
  )
}

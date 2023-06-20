import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenSymbolAndName } from '../hooks/tokenNames'
import { isValidTokenType } from 'utils/TypesAndInterfaces/General'

import { TokenMetadataType, TokensContext } from '../tokens.provider.types'
import { SubsribeOracleDataFeedSubscription, TokensMetadataSubscription } from 'utils/__generated__/graphql'
import { tokenMetadataSchema } from './tokens.types'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'

/**
 * normalizing token prices
 * @param feedsLedger feeds
 * @returns dictionary <tokenSymbol, rate>
 */
export const normalizeTokenPrices = (feedsLedger: SubsribeOracleDataFeedSubscription['aggregator']) => {
  return feedsLedger.reduce<Record<string, number>>((acc, feed) => {
    const { symbol } = getTokenSymbolAndName(feed.name) ?? {}

    if (symbol) {
      acc[symbol] = convertNumberForClient({ number: feed.last_completed_data, grade: feed.decimals })
    }
    return acc
  }, {})
}

/**
 * Normalizing tokens metadata
 * @param tokensFromGql list from tokens from indexer containing all metadata for token and fields to check whether token is
 * loan token, collateral token, m token,
 *
 * @returns tokensMetadata – dictionary <tokenAddress, token metadata>
 * collateralTokens – array of collateral tokens addresses
 * mTokens – array of mTokens addresses
 *
 * TODO: add farm tokens here, lack of info now
 */
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
      try {
        // Validating token type, it should be one of tez | fa2 | fa12
        const tokenType = isValidTokenType(token_standard) ? token_standard : null
        if (!tokenType) {
          throw new Error('Token is invalid token type, not in range tez | fa2 | fa12')
        }

        // parsing metadata schema, to have icon and decimals for token
        const parsedMetadata = tokenMetadataSchema.parse(metadata)

        // check whether token is sMVK cuz it's token that don't really exists, and it's special case
        const isSMVKToken = parsedMetadata.symbol === 'MVK' && !mvk_tokens?.[0]?.address
        const symbolFromIndexer = isSMVKToken ? SMVK_TOKEN_ADDRESS : parsedMetadata.symbol

        // getting symbol, name, icon from tokens mapper, cuz metadata from indexer is not valid for display
        const { symbol, name, icon } = getTokenSymbolAndName(symbolFromIndexer) ?? {}

        const tokenIcon = parsedMetadata.icon ?? icon
        // token should at least have symbol, name and icon to be able to use it on front
        if (!symbol || !name || !tokenIcon) {
          throw new Error(`Token do not have valid symbol, name or icon ${symbol}, ${name}, ${tokenIcon}`)
        }

        // sMVK don't have it's address so we hardcode it on frontend
        const tokenAddress = isSMVKToken ? SMVK_TOKEN_ADDRESS : token_address

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
          // if mvk_tokens?.[0]?.address present and token is collateral that means, that sMVK is collateral, but for smvk we need to manually change it's collateral data
          if (mvk_tokens?.[0]?.address) {
            acc.collateralTokens.push(SMVK_TOKEN_ADDRESS)

            acc.tokensMetadata[SMVK_TOKEN_ADDRESS] = {
              ...acc.tokensMetadata[SMVK_TOKEN_ADDRESS],
              loanData: {
                indexerName: lending_controller_collateral_tokens[0].token_name,
                // sMVK collateral is disabled on demo, so we set isProtectedCollateral true when it's demo env
                isProtectedCollateral: process.env.REACT_APP_IS_DEMO === 'true',
              },
            }
          } else {
            // handling all another collateral tokens
            acc.collateralTokens.push(tokenAddress)

            tokenMetadata.loanData = {
              indexerName: lending_controller_collateral_tokens[0].token_name,
              isProtectedCollateral: lending_controller_collateral_tokens[0].protected,
            }
          }
        }

        // if token is loan token (market token)
        if (lending_controller_loan_tokens?.[0]) {
          tokenMetadata.loanData = {
            ...tokenMetadata.loanData,
            indexerName: lending_controller_loan_tokens[0].loan_token_name,
          }
        }

        // if token is mToken
        if (m_tokens?.[0]?.address) acc.mTokens.push(tokenAddress)

        acc.tokensMetadata[tokenAddress] = { ...acc.tokensMetadata[tokenAddress], ...tokenMetadata }
      } catch (e) {
        console.error('normalizeTokensMetadata error: ', { e })
      } finally {
        return acc
      }
    },
    { tokensMetadata: {}, collateralTokens: [], mTokens: [] },
  )
}

import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenSymbolAndName } from './tokenNames'
import { TokenType, isValidTokenType } from 'utils/TypesAndInterfaces/General'

import {
  TokenIndexerMetadataType,
  TokenMetadataType,
  TokensContext,
  tokenMetadataSchema,
} from '../tokens.provider.types'
import { TokensMetadataQuery } from 'utils/__generated__/graphql'
import { DEFAULT_MIN_COLLATERAL_AMOUNT, SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { checkWhetherTokenIsCollateralToken } from './tokens.utils'
import { TokenPricesFeedsType } from 'providers/DataFeedsProvider/helpers/feeds.schemas'
import { TokensGqlSchemaType } from './tokens.schemes'

/**
 * normalizing token prices
 * @param feedsLedger feeds
 * @returns dictionary <tokenSymbol, rate>
 */
export const normalizeTokenPrices = (feedsLedger: TokenPricesFeedsType) => {
  return feedsLedger.reduce<Record<string, number>>((acc, feedGql) => {
    const { symbol } = getTokenSymbolAndName(feedGql.name) ?? {}

    if (symbol) {
      acc[symbol] = convertNumberForClient({ number: feedGql.last_completed_data, grade: feedGql.decimals })
    }
    return acc
  }, {})
}

// TODO: if need add support of loan tokens and mTokens to mvk | smvk
const handleMvkToken = ({
  token_address,
  token_id,
  tokenType,
  parsedMetadata,
  lending_controller_collateral_tokens,
}: {
  token_address: string
  token_id: number
  tokenType: TokenType
  parsedMetadata: TokenIndexerMetadataType
  lending_controller_collateral_tokens: TokensMetadataQuery['token'][number]['lending_controller_collateral_tokens']
}): {
  smvk: TokenMetadataType | null
  mvk: TokenMetadataType | null
} => {
  const smvkTokenData = getTokenSymbolAndName('smvk')
  const mvkTokenData = getTokenSymbolAndName('mvk')
  const collateralData = {
    indexerName: lending_controller_collateral_tokens[0].token_name,
    // sMVK collateral is disabled on demo, so we set isProtectedCollateral true when it's demo env
    isPausedCollateral: process.env.REACT_APP_IS_DEMO === 'true',
    isScaled: lending_controller_collateral_tokens[0].is_scaled_token,
    isStaked: lending_controller_collateral_tokens[0].is_staked_token,
    minDepositAmount: DEFAULT_MIN_COLLATERAL_AMOUNT,
  }

  const smvkTokenMetadata: TokenMetadataType | null = smvkTokenData
    ? {
        ...smvkTokenData,
        id: token_id,
        type: tokenType,
        decimals: Number(parsedMetadata.decimals),
        address: SMVK_TOKEN_ADDRESS,
        ...(lending_controller_collateral_tokens[0]?.token_name === 'smvk'
          ? {
              loanData: collateralData,
            }
          : {}),
      }
    : null
  const mvkTokenMetadata: TokenMetadataType | null = mvkTokenData
    ? {
        ...mvkTokenData,
        id: token_id,
        type: tokenType,
        decimals: Number(parsedMetadata.decimals),
        address: token_address,
      }
    : null

  return {
    smvk: smvkTokenMetadata,
    mvk: mvkTokenMetadata,
  }
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
export const normalizeTokensMetadata = (tokensFromGql: TokensGqlSchemaType) => {
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

        const symbolFromIndexer = parsedMetadata.symbol

        // getting symbol, name, icon from tokens mapper, cuz metadata from indexer is not valid for display
        const { symbol, name, icon } = getTokenSymbolAndName(symbolFromIndexer) ?? {}

        const tokenIcon = parsedMetadata.icon ?? icon
        // token should at least have symbol, name and icon to be able to use it on front
        if (!symbol || !name || !tokenIcon) {
          throw new Error(`Token do not have valid symbol, name or icon ${symbol}, ${name}, ${tokenIcon}`)
        }

        // we have 2 mvk tokens in indexer one is empty hardcoded and one is token with data, so we need to exclude empty one
        if (symbol === 'MVK' && !mvk_tokens?.[0]?.address) {
          throw new Error(`Omit hardcoded fake mvk token`)
        }

        let tokenMetadata: TokenMetadataType = {
          id: token_id,
          address: token_address,
          symbol,
          name,
          icon: tokenIcon,
          type: tokenType,
          decimals: Number(parsedMetadata.decimals),
        }

        // if token is mvk we need to add mvk & smvk tokens, it's special case
        if (mvk_tokens?.[0]?.address) {
          const { smvk, mvk } = handleMvkToken({
            token_id,
            token_address,
            tokenType,
            parsedMetadata,
            lending_controller_collateral_tokens,
          })

          if (mvk) {
            acc.tokensMetadata[mvk.address] = { ...acc.tokensMetadata[mvk.address], ...mvk }
          }

          if (smvk) {
            acc.tokensMetadata[smvk.address] = { ...acc.tokensMetadata[smvk.address], ...smvk }

            if (checkWhetherTokenIsCollateralToken(smvk)) acc.collateralTokens.push(smvk.address)
          }

          return acc
        }

        // if token is collateral
        if (lending_controller_collateral_tokens[0]) {
          acc.collateralTokens.push(token_address)
          tokenMetadata = {
            ...tokenMetadata,
            loanData: {
              ...tokenMetadata.loanData,
              indexerName: lending_controller_collateral_tokens[0].token_name,
              isPausedCollateral: lending_controller_collateral_tokens[0].paused,
              isScaled: lending_controller_collateral_tokens[0].is_scaled_token,
              isStaked: lending_controller_collateral_tokens[0].is_staked_token,
              minDepositAmount: DEFAULT_MIN_COLLATERAL_AMOUNT,
            },
          }
        }

        // if token is loan token (market token)
        if (lending_controller_loan_tokens[0]) {
          tokenMetadata = {
            ...tokenMetadata,
            loanData: {
              ...tokenMetadata.loanData,
              indexerName: lending_controller_loan_tokens[0].loan_token_name,
              minDepositAmount: convertNumberForClient({
                number: lending_controller_loan_tokens[0].min_repayment_amount,
                grade: tokenMetadata.decimals,
              }),
            },
          }
        }

        // if token is mToken
        if (m_tokens?.[0]?.address) acc.mTokens.push(token_address)

        acc.tokensMetadata[token_address] = { ...acc.tokensMetadata[token_address], ...tokenMetadata }
      } catch (e) {
        console.error('normalizeTokensMetadata error: ', { e })
      } finally {
        return acc
      }
    },
    { tokensMetadata: {}, collateralTokens: [], mTokens: [] },
  )
}

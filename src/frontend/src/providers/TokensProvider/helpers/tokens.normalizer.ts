// utils
import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenSymbolAndName } from './tokenNames'
import { checkWhetherTokenIsCollateralToken } from './tokens.utils'

// types
import { TokenMetadataType, TokensContextStateType } from '../tokens.provider.types'
import { TokenPricesFeedsType } from 'providers/DataFeedsProvider/helpers/feeds.schemas'
import { isValidTokenType, TokenType } from 'utils/TypesAndInterfaces/General'
import { TokensMetadataQuery } from 'utils/__generated__/graphql'

// consts
import { DEFAULT_MIN_COLLATERAL_AMOUNT, SMVN_TOKEN_ADDRESS } from 'utils/constants'
import {
  farmLiquidityPairTokenMetadataSchema,
  farmLiquidityTokenMetadataSchema,
  farmLpSubtokenMetadataSchema,
  mTokenMetadataSchema,
  TokenIndexerMetadataType,
  tokenMetadataSchema,
  TokensGqlSchemaType,
} from './tokens.schemes'

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

const handleMvnToken = ({
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
  smvn: TokenMetadataType | null
  mvn: TokenMetadataType | null
} => {
  const smvnTokenData = getTokenSymbolAndName('smvn')
  const mvnTokenData = getTokenSymbolAndName('mvn')

  const collateralData = {
    indexerName: lending_controller_collateral_tokens?.[0]?.token_name,
    // sMVN collateral is disabled on demo, so we set isProtectedCollateral true when it's demo env
    isPausedCollateral: process.env.REACT_APP_IS_DEMO === 'true',
    isScaled: lending_controller_collateral_tokens?.[0]?.is_scaled_token,
    isStaked: lending_controller_collateral_tokens?.[0]?.is_staked_token,
    minDepositAmount: DEFAULT_MIN_COLLATERAL_AMOUNT,
  }

  const smvnTokenMetadata: TokenMetadataType | null = smvnTokenData
    ? {
        ...smvnTokenData,
        id: token_id,
        type: tokenType,
        decimals: Number(parsedMetadata.decimals),
        address: SMVN_TOKEN_ADDRESS,
        ...(lending_controller_collateral_tokens?.[0]?.token_name === 'smvn'
          ? {
              loanData: collateralData,
            }
          : {}),
      }
    : null
  const mvnTokenMetadata: TokenMetadataType | null = mvnTokenData
    ? {
        ...mvnTokenData,
        id: token_id,
        type: tokenType,
        decimals: Number(parsedMetadata.decimals),
        address: token_address,
      }
    : null

  return {
    smvn: smvnTokenMetadata,
    mvn: mvnTokenMetadata,
  }
}

/**
 * farm can have liquidityPairTokenParsed -> 2 tokens unite into 1 token,
 * and liquidityTokenParsed -> 1 tokens that represents farm
 * this util parsing metadata of that tokens to get its address and symbol
 */
const parseFarmLiquidityToken = (lpTokenMetadata: any) => {
  const liquidityPairTokenParsed = farmLiquidityPairTokenMetadataSchema.safeParse(lpTokenMetadata)
  const liquidityTokenParsed = farmLiquidityTokenMetadataSchema.safeParse(lpTokenMetadata)

  if (liquidityPairTokenParsed.success)
    return {
      tokenAddress: liquidityPairTokenParsed.data.liquidityPairToken.tokenAddress[0],
      symbol: liquidityPairTokenParsed.data.liquidityPairToken.symbol[0],
      // symbol: liquidityPairTokenParsed.data.liquidityPairToken.origin[0],
    }

  if (liquidityTokenParsed.success)
    return {
      tokenAddress: liquidityTokenParsed.data.liquidityToken.tokenAddress[0],
      symbol: liquidityTokenParsed.data.liquidityToken.symbol[0],
      // symbol: liquidityTokenParsed.data.liquidityToken.origin[0],
    }

  throw new Error('parsing lp token metadata error')
}

/**
 * util to get tokens that related to farms, and get tokens that creating this token, by uniting
 * also farm token can consis only from 1 token, it's also covered here
 */
const handleFarmLpToken = (tokenFromGql: TokensGqlSchemaType[number]): TokenMetadataType | null => {
  try {
    const { token_id, token_standard, farms_lp_tokens, metadata, token_address } = tokenFromGql

    const farmLpToken = farms_lp_tokens[0]
    if (!farmLpToken) return null

    // Validating token type, it should be one of tez | fa2 | fa12
    const tokenType = isValidTokenType(token_standard) ? token_standard : null
    if (!tokenType) {
      throw new Error('Token is invalid token type, not in range mav | fa2 | fa12')
    }

    // parsing token metadata schema, to have icon and decimals for token
    const parsedMetadata = tokenMetadataSchema.parse(metadata)

    if (!farmLpToken.metadata) return null

    // parsing liquidity pair token metadata schema, to have symbol and address for token
    const { symbol } = parseFarmLiquidityToken(farmLpToken.metadata)

    const tokenMetadata: TokenMetadataType = {
      id: token_id,
      // on indexer v1 farm token address fas adress in metadata, TODO: clarify it with tristan
      // address: tokenAddress,
      address: token_address,
      symbol,
      name: symbol,
      type: tokenType,
      // TODO: add noImage link
      icon: parsedMetadata.icon ?? 'noImage',
      decimals: Number(parsedMetadata.decimals),
    }

    if (farmLpToken.token0 && farmLpToken.token1) {
      const liquidityPairToken0Parsed = farmLpSubtokenMetadataSchema.parse(farmLpToken.token0.metadata)
      const liquidityPairToken1Parsed = farmLpSubtokenMetadataSchema.parse(farmLpToken.token1.metadata)

      tokenMetadata.farmLpData = {
        token0: {
          address: farmLpToken.token0.token_address,
          name: liquidityPairToken0Parsed.name,
          symbol: liquidityPairToken0Parsed.symbol,
          decimals: Number(liquidityPairToken0Parsed.decimals),
          icon: liquidityPairToken0Parsed.icon ?? '/images/coin-gold.svg',
        },
        token1: {
          address: farmLpToken.token1.token_address,
          name: liquidityPairToken1Parsed.name,
          symbol: liquidityPairToken1Parsed.symbol,
          decimals: Number(liquidityPairToken1Parsed.decimals),
          icon: liquidityPairToken1Parsed.icon ?? '/images/coin-silver.svg',
        },
      }
    } else {
      tokenMetadata.farmLpData = {
        token0: null,
        token1: null,
      }
    }

    return tokenMetadata
  } catch (e) {
    console.error('handleFarmLpToken error:', e)
    return null
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
 */
export const normalizeTokensMetadata = (tokensFromGql: TokensGqlSchemaType) => {
  return tokensFromGql.reduce<Omit<TokensContextStateType, 'tokensPrices'>>(
    (acc, tokenFromGql) => {
      try {
        // if token has farms_lp_tokens data, normalize it
        if (tokenFromGql.farms_lp_tokens.length) {
          const farmLpTokenMetadata = handleFarmLpToken(tokenFromGql)

          if (farmLpTokenMetadata) {
            acc.tokensMetadata[farmLpTokenMetadata.address] = farmLpTokenMetadata
            acc.farmLpTokens.push(farmLpTokenMetadata.address)
          }
        }

        const {
          token_id,
          token_address,
          token_standard,
          metadata,
          lending_controller_collateral_tokens,
          lending_controller_loan_tokens,
          m_tokens,
          mvn_tokens,
        } = tokenFromGql

        // Validating token type, it should be one of tez | fa2 | fa12
        const tokenType = isValidTokenType(token_standard) ? token_standard : null
        if (!tokenType) {
          throw new Error('Token is invalid token type, not in range mav | fa2 | fa12')
        }

        // parsing metadata schema, to have icon and decimals for token
        const parsedMetadata = tokenMetadataSchema.parse(metadata)

        const symbolFromIndexer = parsedMetadata.symbol

        if (!symbolFromIndexer) {
          throw new Error(`symbolFromIndexer is undefined`)
        }

        // getting symbol, name, icon from tokens mapper, cuz metadata from indexer is not valid for display
        const { symbol, name, icon } = getTokenSymbolAndName(symbolFromIndexer.toLowerCase()) ?? {}

        // TODO: parsedMetadata.icon should be primary to use actual not hardcoded image
        const tokenIcon = icon ?? parsedMetadata.icon
        // token should at least have symbol, name and icon to be able to use it on front
        if (!symbol || !name || !tokenIcon) {
          throw new Error(`Token do not have valid symbol, name or icon ${symbol}, ${name}, ${tokenIcon}`)
        }

        // we have 2 mvn tokens in indexer one is empty hardcoded and one is token with data, so we need to exclude empty one
        if (symbol === 'MVN' && !mvn_tokens?.[0]?.address) {
          throw new Error(`Omit hardcoded fake mvn token`)
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

        // if token is mvn we need to add mvn & smvn tokens, it's special case
        if (mvn_tokens?.[0]?.address) {
          const { smvn, mvn } = handleMvnToken({
            token_id,
            token_address,
            tokenType,
            parsedMetadata,
            lending_controller_collateral_tokens,
          })

          if (mvn) {
            acc.tokensMetadata[mvn.address] = { ...acc.tokensMetadata[mvn.address], ...mvn }
          }

          if (smvn) {
            acc.tokensMetadata[smvn.address] = { ...acc.tokensMetadata[smvn.address], ...smvn }

            if (checkWhetherTokenIsCollateralToken(smvn)) acc.collateralTokens.push(smvn.address)
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
        if (m_tokens?.[0]?.address) {
          const {
            assets: [{ decimals: interestRateDecimals }],
          } = mTokenMetadataSchema.parse(m_tokens[0]?.metadata)

          acc.mTokens.push(token_address)
          tokenMetadata = {
            ...tokenMetadata,
            mToken: {
              interestRateDecimals: Number(interestRateDecimals),
            },
          }
        }

        acc.tokensMetadata[token_address] = { ...acc.tokensMetadata[token_address], ...tokenMetadata }
      } catch (_) {
        // Expected for tokens with malformed metadata — the reduce continues processing valid tokens
      } finally {
        return acc
      }
    },
    { tokensMetadata: {}, collateralTokens: [], mTokens: [], farmLpTokens: [] },
  )
}

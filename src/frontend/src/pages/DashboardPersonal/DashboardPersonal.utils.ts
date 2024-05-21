import { TokensContext } from './../../providers/TokensProvider/tokens.provider.types'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { UserContext } from 'providers/UserProvider/user.provider.types'
import { SMVN_TOKEN_ADDRESS, MVRK_TOKEN_ADDRESS } from 'utils/constants'

export const PORTFOLIO_TAB_ID = 'portfolio'
export const SATELLITE_TAB_ID = 'satellite'
export const DELEGATION_TAB_ID = 'delegation'
export const VESTING_TAB_ID = 'vesting'

export const PORTFOLIO_POSITION_TAB_ID = 'lendBorrowPositon'
export const PORTFOLIO_LENDING_TAB_ID = 'lendingTx'
export const PORTFOLIO_BORROWING_TAB_ID = 'borrowingTx'

export type TabId = typeof PORTFOLIO_TAB_ID | typeof SATELLITE_TAB_ID | typeof DELEGATION_TAB_ID | typeof VESTING_TAB_ID
export type SecondaryTabId =
  | typeof PORTFOLIO_POSITION_TAB_ID
  | typeof PORTFOLIO_LENDING_TAB_ID
  | typeof PORTFOLIO_BORROWING_TAB_ID

export const isValidPersonalDashboardTabId = (x: string): x is TabId =>
  x === PORTFOLIO_TAB_ID || x === SATELLITE_TAB_ID || x === DELEGATION_TAB_ID || x === VESTING_TAB_ID

export const isValidPersonalDashboardSecondaryTabId = (x: string): x is SecondaryTabId =>
  x === PORTFOLIO_BORROWING_TAB_ID || x === PORTFOLIO_POSITION_TAB_ID || x === PORTFOLIO_LENDING_TAB_ID

export const getDbPersonalUserWalletData = ({
  userTokensBalances,
  tokensMetadata,
  tokensPrices,
  mTokens,
  mvnTokenAddress,
}: {
  userTokensBalances: UserContext['userTokensBalances']
  tokensMetadata: TokensContext['tokensMetadata']
  tokensPrices: TokensContext['tokensPrices']
  mTokens: TokensContext['mTokens']
  mvnTokenAddress: string | null
}) => {
  const mostSuppliedUserToken = (userTokensBalances ? Object.keys(userTokensBalances) : []).reduce<null | {
    address: string
    symbol: string
    balance: number
  }>((acc, tokenAddress) => {
    // If token is mToken or shown by default return acc, we skip such tokens
    if (
      tokenAddress === mvnTokenAddress ||
      tokenAddress === SMVN_TOKEN_ADDRESS ||
      tokenAddress === MVRK_TOKEN_ADDRESS ||
      mTokens.includes(tokenAddress)
    )
      return acc

    const tokenToCheck = getTokenDataByAddress({ tokensMetadata, tokenAddress, tokensPrices })
    const tokenToCheckBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress })

    // If token to compare is not valid skip check
    if (!tokenToCheck || !tokenToCheck.rate) return acc

    // if we don't have acc, make acc current token, cuz it's valid
    if (!acc)
      return {
        address: tokenAddress,
        balance: tokenToCheckBalance,
        symbol: tokenToCheck.symbol,
      }

    const accToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: acc.address, tokensPrices })

    // check for acc token exist to make ts satisfied, cuz it's 100% valid token inside acc
    if (!accToken || !accToken.rate) return acc

    const { rate: checkTokenRate } = tokenToCheck
    const { rate: accTokenRate } = accToken
    const accTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: acc.address })

    return accTokenBalance * accTokenRate > tokenToCheckBalance * checkTokenRate
      ? acc
      : {
          address: tokenToCheck.address,
          balance: tokenToCheckBalance,
          symbol: tokenToCheck.symbol,
        }
  }, null)

  return {
    xtzAmount: getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: MVRK_TOKEN_ADDRESS }),
    sMvnAmount: getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVN_TOKEN_ADDRESS }),
    mvnAmount: getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvnTokenAddress }),
    ...(mostSuppliedUserToken
      ? {
          mostSuppliedUserToken: {
            name: mostSuppliedUserToken.symbol,
            amount: mostSuppliedUserToken.balance,
          },
        }
      : {}),
  }
}

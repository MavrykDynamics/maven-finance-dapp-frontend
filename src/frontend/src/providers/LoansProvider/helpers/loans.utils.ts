import { UserMTokenType } from 'providers/TokensProvider/tokens.provider.types'
import { convertNumberForClient } from 'utils/calcFunctions'

// HELPER TO GET OPERATION NAME BY ITS TYPE
export const getDescrByType = (type: number) => {
  switch (type) {
    case 0:
      return 'Liquidity Added'
    case 1:
      return 'Liquidity Removed'
    case 2:
      return 'Borrowed'
    case 3:
      return 'Repaid'
    case 4:
      return 'Deposited'
    case 5:
      return 'Withdrawed'
    case 6:
      return 'Deposited SMVK'
    case 7:
      return 'Withdrawed SMVK'
    case 8:
      return 'Vault Created'
    case 9:
      return 'Vault Marked for Liq.'
    case 10:
      return 'Vault Liquidated'
    case 11:
      return 'Vault Closed'
    default:
      return null
  }
}

/**
 * getting userMToken
 * @param userMTokens list of user supplied mTokens
 * @param loanMtokenAddress address of mToken we want to get from user
 * @returns lendValue – mToken balance (including rewards), interestEarned – already earned rewards
 */
export const getMarketUserLengingItem = (userMTokens: Array<UserMTokenType>, loanMtokenAddress: string) => {
  const mTokenAsset = userMTokens?.find(({ tokenAddress }) => tokenAddress === loanMtokenAddress)

  if (mTokenAsset) {
    return {
      lendValue: mTokenAsset.lendedAmount,
      interestEarned: mTokenAsset.rewardsEarned,
    }
  }

  return null
}

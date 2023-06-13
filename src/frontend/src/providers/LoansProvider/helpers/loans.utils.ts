import { MTokenType } from 'utils/TypesAndInterfaces/User'

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

// get lending item for user
export const getMarketUserLengingItem = (userMTokens: Array<MTokenType>, loanMtokenAddress: string) => {
  const mTokenAsset = userMTokens?.find(({ tokenAddress }) => tokenAddress === loanMtokenAddress)

  if (mTokenAsset) {
    return {
      lendValue: mTokenAsset.balance,
      interestEarned: mTokenAsset.rewards_earned,
      mBalance: mTokenAsset.balance + mTokenAsset.rewards_earned,
    }
  }

  return null
}

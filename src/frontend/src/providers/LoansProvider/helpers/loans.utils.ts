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

// get lending item of user
export const getMarketUserLengingItem = (userMTokens: Array<UserMTokenType>, loanMtokenAddress: string) => {
  const mTokenAsset = userMTokens?.find(({ tokenAddress }) => tokenAddress === loanMtokenAddress)

  if (mTokenAsset) {
    const interestRateDecimals = mTokenAsset.interestRateDecimals

    const convertedRewards = convertNumberForClient({ number: mTokenAsset.rewards_earned, grade: interestRateDecimals })
    const convertedBalance = convertNumberForClient({ number: mTokenAsset.balance, grade: interestRateDecimals })

    return {
      lendValue: mTokenAsset.lendedAmount,
      interestEarned: convertedRewards,
      // TODO: check whether i need here convertedBalance & convertedRewards
      mBalance: mTokenAsset.lendedAmount + convertedBalance + convertedRewards,
    }
  }

  return null
}

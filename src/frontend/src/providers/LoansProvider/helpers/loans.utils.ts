import { GetLoansMarketsSubscriptionSubscription } from 'utils/__generated__/graphql'

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
      return 'Withdrawn'
    case 6:
      return 'Deposited SMVK'
    case 7:
      return 'Withdrew SMVK'
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

// HELPER FOR LENDING APY
export const calcLendingAPY = (currentInterestRate: number, treasuryShare: number): number => {
  const secondsPerYear = 60 * 60 * 24 * 365

  const top = currentInterestRate - treasuryShare
  const firstTerm = 1 + top / secondsPerYear
  const power = firstTerm ** secondsPerYear
  return (power - 1) * 100
}

export const calcMarketAvaliableLiquidity = ({
  total_remaining,
  token_pool_total,
  reserve_ratio,
}: Pick<
  GetLoansMarketsSubscriptionSubscription['lending_controller'][number]['loan_tokens'][number],
  'total_remaining' | 'token_pool_total' | 'reserve_ratio'
>) => {
  const reserveAmount = token_pool_total * (reserve_ratio / 10000)

  return {
    reserveAmount,
    availableLiquidity: total_remaining - reserveAmount,
    reserveFactor: reserve_ratio / 100,
  }
}

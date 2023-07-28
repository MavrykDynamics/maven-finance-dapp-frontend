import { GetLLoansConfigSubscription, GetLoansMarketsSubscriptionSubscription } from 'utils/__generated__/graphql'
import { LoansContext } from '../loans.provider.types'
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'
import { calcLendingAPY, calcMarketAvaliableLiquidity } from './loans.utils'

export const normalizeLoansConfig = ({
  indexerData,
}: {
  indexerData: GetLLoansConfigSubscription
}): LoansContext['config'] => {
  return {
    daoFee: indexerData.lending_controller[0].minimum_loan_fee_pct / 100,
    collateralFactor: indexerData.lending_controller[0].collateral_ratio / 10,
  }
}

export const normalizeLoansMarkets = ({ indexerData }: { indexerData: GetLoansMarketsSubscriptionSubscription }) => {
  const {
    lending_controller: [
      { interest_rate_decimals: interestRateDecimals, interest_treasury_share, decimals, loan_tokens },
    ],
  } = indexerData
  const treasuryShare = convertNumberForClient({ number: interest_treasury_share, grade: decimals })

  return loan_tokens?.reduce<LoansContext['marketsMapper']>((acc, loanToken) => {
    const {
      utilisation_rate,
      token_pool_total,
      total_borrowed,
      current_interest_rate,
      token: { token_address: loanTokenAddress },
      m_token: {
        address: loanMTokenAddress,
        accounts_aggregate: { aggregate: suppliers },
      },
      vaults_aggregate: { aggregate: borrowers },
    } = loanToken

    const { reserveAmount, reserveFactor, availableLiquidity } = calcMarketAvaliableLiquidity(loanToken)

    const tokenCurrentInterestRate = convertNumberForClient({
      number: current_interest_rate,
      grade: interestRateDecimals,
    })
    const utilizationRate = convertNumberForClient({ number: utilisation_rate, grade: interestRateDecimals })

    acc[loanTokenAddress] = {
      loanTokenAddress,
      loanMTokenAddress,
      utilisationRate: getNumberInBounds(0, 100, utilizationRate * 100),

      availableLiquidity,
      totalLended: token_pool_total,
      totalBorrowed: total_borrowed,

      borrowers: borrowers?.count ?? 0,
      suppliers: suppliers?.count ?? 0,

      reserveFactor,
      reserveAmount,
      borrowAPR: tokenCurrentInterestRate * 100,
      lendingAPY: calcLendingAPY(utilizationRate, tokenCurrentInterestRate, treasuryShare),
    }

    return acc
  }, {})
}

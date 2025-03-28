// @ts-nocheck

import { GetLoansConfigQuery } from 'utils/__generated__/graphql'
import { LoansContext, MarketsIndexerDataType } from '../loans.provider.types'
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'
import { calcLendingAPY, calcMarketAvailableLiquidity } from './loans.utils'

export const normalizeLoansConfig = ({ indexerData }: { indexerData: GetLoansConfigQuery }): LoansContext['config'] => {
  return {
    daoFee: indexerData.lending_controller[0].minimum_loan_fee_pct / 100,
    collateralFactor: indexerData.lending_controller[0].collateral_ratio / 10,
  }
}

export const normalizeLoansMarkets = ({ indexerData }: { indexerData: MarketsIndexerDataType }) => {
  const {
    markets,
    lending_controller: [
      { interest_rate_decimals: interestRateDecimals, interest_treasury_share, decimals },
    ],
  } = indexerData
  const treasuryShare = convertNumberForClient({ number: interest_treasury_share, grade: decimals })

  return markets?.reduce<LoansContext['marketsMapper']>((acc, loanToken) => {
    const {
      utilisation_rate,
      token_pool_total,
      total_borrowed,
      current_interest_rate,
      token_address: loanTokenAddress ,
      m_token_address: loanMTokenAddress,
      depositors_count: suppliers, //TODO check it
      rewards_earned_total: mTokenRewardsAggregate, //TODO check it
      borrowers_count: borrowers, //TODO check it
    } = loanToken

    const { reserveAmount, reserveFactor, availableLiquidity } = calcMarketAvailableLiquidity(loanToken)

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
      totalRewards: mTokenRewardsAggregate ?? 0,

      borrowers: borrowers ?? 0,
      suppliers: suppliers ?? 0,

      reserveFactor,
      reserveAmount,
      borrowAPR: tokenCurrentInterestRate * 100,
      lendingAPY: calcLendingAPY(utilizationRate, tokenCurrentInterestRate, treasuryShare),
    }

    return acc
  }, {})
}

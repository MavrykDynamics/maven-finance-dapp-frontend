import { LoanMarketType, LendingControllerGQL, MvkTokenOperatorGQL } from 'utils/TypesAndInterfaces/Loans'

import { convertNumberForClient, calcWithoutDecimals, getNumberInBounds } from 'utils/calcFunctions'
import { calcLendingAPY } from './Loans.helpers'

// Normalizing lend\borrow market
export const normalizeLoans = ({
  lendingController,
  mvkTokenOperators: mvkTokenOperatorsStorage,
}: {
  lendingController: LendingControllerGQL
  mvkTokenOperators: MvkTokenOperatorGQL[]
}) => {
  const interestTreasuryShare = calcWithoutDecimals(
    lendingController?.interest_treasury_share,
    lendingController.decimals,
  )
  const interestRateDecimals = lendingController?.interest_rate_decimals ?? 0

  const config = {
    DAOFee: (lendingController?.minimum_loan_fee_pct ?? 0) / 100,
    loansControllerAddress: lendingController?.address,
  }

  const loanTokens = lendingController?.loan_tokens?.reduce<Array<LoanMarketType>>((acc, loanToken) => {
    const {
      utilisation_rate,
      total_remaining,
      reserve_ratio,
      token_pool_total,
      total_borrowed,
      token: { token_address },
      m_token,
      vaults_aggregate: { aggregate },
    } = loanToken

    if (!token_address) return acc

    // TODO: check calcs
    const reserveAmount = token_pool_total * (reserve_ratio / 10000)
    // const reserveAmount = convertNumberForClient({ number: token_pool_total, grade: loanTokenMetadata.decimals }) * (reserve_ratio / 10000)

    // TODO: check calcs
    const availableLiquidity = total_remaining - reserveAmount
    // const availableLiquidity = (convertNumberForClient({ number: total_remaining, grade: loanTokenMetadata.decimals }) - reserveAmount) * loanTokenMetadata.rate

    const tokenCurrentInterestRate = calcWithoutDecimals(loanToken.current_interest_rate, interestRateDecimals)
    const lendAPY = calcLendingAPY(tokenCurrentInterestRate, interestTreasuryShare)
    const borrowAPR = tokenCurrentInterestRate * 100

    acc.push({
      loanTokenAddress: token_address,
      loanMTokenAddress: m_token.address,
      utilisationRate: getNumberInBounds(
        0,
        100,
        convertNumberForClient({ number: utilisation_rate, grade: interestRateDecimals }) * 100,
      ),

      availableLiquidity,
      totalLended: token_pool_total,
      totalBorrowed: total_borrowed,

      borrowers: aggregate?.count ?? 0,
      suppliers: m_token?.accounts_aggregate?.aggregate?.count ?? 0,

      collateralFactor: lendingController.collateral_ratio / 10,
      reserveFactor: reserve_ratio / 100,
      reserveAmount,
      borrowAPR: borrowAPR,
      lendingAPY: lendAPY,
    })

    return acc
  }, [])

  return {
    loanTokens,
    mvkTokenOperators: mvkTokenOperatorsStorage?.map((item) => item.operator.address) ?? [],
    config,
  }
}

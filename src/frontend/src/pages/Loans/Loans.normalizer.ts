import {
  LoanMarketType,
  LendingControllerGQL,
  UserLendObjType,
  MvkTokenOperatorGQL,
} from 'utils/TypesAndInterfaces/Loans'
import { Mavryk_User } from 'utils/generated/graphqlTypes'

import { convertNumberForClient, calcWithoutDecimals, getNumberInBounds } from 'utils/calcFunctions'
import { calcLendingAPY } from './Loans.helpers'

// Normalize user loans data
export const normalizeUserLending = ({
  userDataLoansHistoryGql,
  userVaultsDataGql,
}: {
  userDataLoansHistoryGql: Mavryk_User['lending_controller_history_data_sender']
  userVaultsDataGql: Mavryk_User['lending_controller_vaults']
}) => {
  const { userLendings, userBorrowing } = userDataLoansHistoryGql?.reduce<{
    userLendings: Array<UserLendObjType>
    userBorrowing: Array<UserLendObjType>
  }>(
    (
      acc,
      {
        type,
        loan_token,
        id,
        amount,
        operation_hash,
        timestamp,
        lending_controller: { interest_rate_decimals, interest_treasury_share, decimals },
      },
    ) => {
      const tokenAddress = loan_token?.token.token_address
      if (!tokenAddress) return acc

      const commonUserData = {
        id,
        date: timestamp,
        tokenAddress,
        operationHash: operation_hash,
        annualPecentage: calcLendingAPY(
          calcWithoutDecimals(loan_token.current_interest_rate, interest_rate_decimals),
          calcWithoutDecimals(interest_treasury_share, decimals),
        ),
      }

      switch (type) {
        case 0:
          acc.userLendings.push({
            ...commonUserData,
            amount,
          })
          break
        case 1:
          acc.userLendings.push({
            ...commonUserData,
            amount: -amount,
          })
          break
        case 2:
          acc.userBorrowing.push({
            ...commonUserData,
            amount,
          })
          break
        case 3:
          acc.userBorrowing.push({
            ...commonUserData,
            amount: -amount,
          })
          break
      }

      return acc
    },
    { userLendings: [], userBorrowing: [] },
  ) ?? { userLendings: [], userBorrowing: [] }

  const userVaultsData =
    userVaultsDataGql?.reduce<Record<string, { borrowedAmount: number; collateralAmount: number }>>(
      (acc, { collateral_balances, loan_token, loan_principal_total }) => {
        const tokenAddress = loan_token?.token.token_address

        if (!tokenAddress) return acc

        const collateralAmount = collateral_balances.reduce(
          (acc, { balance, collateral_token: { token, token_name, oracle } }) => {
            const collateralTokenAddress = token?.token_address
            if (!collateralTokenAddress) return acc

            // TODO: needs to be balance in usd
            acc += balance
            return acc
          },
          0,
        )

        acc[loan_token.loan_token_name] = {
          // TODO: needs to be loan_principal_total in usd
          borrowedAmount: loan_principal_total,
          collateralAmount,
        }

        return acc
      },
      {},
    ) ?? {}

  return {
    userLendings,
    userBorrowing,
    userVaultsData,
  }
}

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

    // TODO: add calcs
    const reserveAmount = (token_pool_total * reserve_ratio) / 10000
    // const reserveAmount = convertNumberForClient({ number: token_pool_total, grade: loanTokenMetadata.decimals }) * (reserve_ratio / 10000)

    // TODO: check calcs
    const availableLiquidity = total_remaining - reserveAmount
    // const availableLiquidity = (convertNumberForClient({ number: total_remaining, grade: loanTokenMetadata.decimals }) - reserveAmount) * loanTokenMetadata.rate

    const tokenCurrentInterestRate = calcWithoutDecimals(loanToken.current_interest_rate, interestRateDecimals)
    const lendAPY = calcLendingAPY(tokenCurrentInterestRate, interestTreasuryShare)
    const borrowAPR = tokenCurrentInterestRate * 100

    acc.push({
      loanTokenAddress: token_address,
      loanMTokenAddress: m_token.token.token_address,
      utilisationRate: getNumberInBounds(
        0,
        100,
        convertNumberForClient({ number: utilisation_rate, grade: interestRateDecimals }) * 100,
      ),

      availableLiquidity,
      totalLended: token_pool_total,
      totalBorrowed: total_borrowed,

      borrowers: aggregate?.count ?? 0,

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

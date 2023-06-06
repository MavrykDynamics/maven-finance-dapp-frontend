import { State } from 'reducers'
import { LoanMarketType, LoansGQL, UserLendObjType } from 'utils/TypesAndInterfaces/Loans'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { UserState } from 'reducers/wallet'
import { Mavryk_User } from 'utils/generated/graphqlTypes'

import { convertNumberForClient, calcWithoutDecimals, getNumberInBounds } from 'utils/calcFunctions'
import { calcLendingAPY, getAssetMetadata, getChartData, getLendingItem, getTransactionHistory } from './Loans.helpers'
import { DataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider.types'

// Normalize user loans data
export const normalizeUserLending = ({
  dipDupTokens,
  userDataLoansHistoryGql,
  userVaultsDataGql,
  feeds,
}: {
  dipDupTokens: State['tokens']['dipDupTokens']
  feeds: DataFeedsContext['feedsMapper']
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
      if (!loan_token) return acc
      const assetData = getAssetMetadata({
        tokenAddress: loan_token.loan_token_address,
        tokenName: loan_token.loan_token_name,
        dipDupTokens,
        feeds,
        oracleId: String(loan_token.oracle_id),
      })

      if (!assetData) return acc
      const convertedAmount = convertNumberForClient({ number: amount, grade: assetData.decimals })
      const commonUserData = {
        icon: assetData.icon,
        id,
        date: timestamp,
        symbol: assetData.symbol,
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
            amount: convertedAmount,
            usdAmount: convertedAmount * assetData.rate,
          })
          break
        case 1:
          acc.userLendings.push({
            ...commonUserData,
            amount: -convertedAmount,
            usdAmount: -(convertedAmount * assetData.rate),
          })
          break
        case 2:
          acc.userBorrowing.push({
            ...commonUserData,
            amount: convertedAmount,
            usdAmount: convertedAmount * assetData.rate,
          })
          break
        case 3:
          acc.userBorrowing.push({
            ...commonUserData,
            amount: convertedAmount,
            usdAmount: -(convertedAmount * assetData.rate),
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
        if (!loan_token) return acc
        const vaultAssetData = getAssetMetadata({
          tokenAddress: loan_token.loan_token_address,
          tokenName: loan_token.loan_token_name,
          dipDupTokens,
          feeds,
          oracleId: String(loan_token.oracle_id),
        })

        if (!vaultAssetData) return acc

        const collateralAmount = collateral_balances.reduce((acc, { balance, token }) => {
          if (!token) return acc
          const collateralAssetData = getAssetMetadata({
            tokenAddress: token.token_address,
            tokenName: token.token_name,
            dipDupTokens,
            feeds,
            oracleId: String(token.oracle_id),
          })

          if (!collateralAssetData) return acc

          acc +=
            convertNumberForClient({ number: balance, grade: collateralAssetData.decimals }) * collateralAssetData.rate
          return acc
        }, 0)

        acc[loan_token.loan_token_name] = {
          borrowedAmount:
            convertNumberForClient({ number: loan_principal_total, grade: vaultAssetData.decimals }) *
            vaultAssetData.rate,
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
export const normalizeLoans = async ({
  storage,
  dipDupData,
  mTokens,
  userMTokens,
  userAddres,
  feeds,
}: {
  storage: LoansGQL
  dipDupData: State['tokens']['dipDupTokens']
  mTokens: State['tokens']['mTokens']
  userMTokens: UserState['userMTokens']
  userAddres?: string
  feeds: DataFeedsContext['feedsMapper']
}) => {
  const interestTreasuryShare = calcWithoutDecimals(storage?.interest_treasury_share, storage.decimals)
  const interestRateDecimals = storage?.interest_rate_decimals ?? 0
  const config = {
    DAOFee: (storage?.minimum_loan_fee_pct ?? 0) / 100,
  }

  try {
    const loanTokens = await storage?.loan_tokens?.reduce<Promise<Array<LoanMarketType>>>(
      async (promiseAcc, loanToken) => {
        const acc: LoanMarketType[] = await promiseAcc

        const {
          loan_token_name,
          utilisation_rate,
          total_remaining,
          history_data,
          reserve_ratio,
          token_pool_total,
          total_borrowed,
          loan_token_address,
          loan_token_contract_standard,
          oracle_id,
          m_token,
          vaults_aggregate: { aggregate },
        } = loanToken

        const loanTokenMetadata = getAssetMetadata({
          tokenName: loan_token_name,
          tokenAddress: loan_token_address,
          dipDupTokens: dipDupData,
          feeds,
          oracleId: String(oracle_id),
        })

        const appropriateMtokenData = mTokens.find(
          ({ loan_token_name: m_token_name }) => loan_token_name === m_token_name,
        )

        if (!loanTokenMetadata) return acc
        const reserveAmount =
          convertNumberForClient({ number: token_pool_total, grade: loanTokenMetadata.decimals }) *
          (reserve_ratio / 10000)
        const availableLiquidity =
          (convertNumberForClient({ number: total_remaining, grade: loanTokenMetadata.decimals }) - reserveAmount) *
          loanTokenMetadata.rate

        const {
          transactionHistory,
          lending24hVolume,
          borrowing24hVolume,
          marketCollateralChartData,
          marketLiquidityChartData,
        } = getTransactionHistory(history_data, dipDupData, feeds)

        const lendingItem = getLendingItem(m_token?.address ?? null, userMTokens, userAddres)

        const tokenCurrentInterestRate = calcWithoutDecimals(loanToken.current_interest_rate, interestRateDecimals)
        const lendAPY = calcLendingAPY(tokenCurrentInterestRate, interestTreasuryShare)
        const borrowAPR = tokenCurrentInterestRate * 100

        acc.push({
          loanTokenData: {
            ...loanTokenMetadata,
            // TODO: remove condition after adding new token list
            name: loanTokenMetadata.symbol === 'EURL' ? 'Lugh' : loanTokenMetadata.symbol,
            tokenType: loan_token_contract_standard as TokenType,
          },
          lendingItem,
          transactionHistory: [...transactionHistory].reverse(),
          marketCollateralChartData,
          marketLiquidityChartData,
          utilisationRate: getNumberInBounds(
            0,
            100,
            convertNumberForClient({ number: utilisation_rate, grade: interestRateDecimals }) * 100,
          ),

          availableLiquidity,
          totalLended: convertNumberForClient({ number: token_pool_total, grade: loanTokenMetadata.decimals }),
          totalBorrowed: convertNumberForClient({ number: total_borrowed, grade: loanTokenMetadata.decimals }),

          borrowers: aggregate?.count ?? 0,
          suppliers: appropriateMtokenData?.accounts.length ?? 0,
          lending24hVolume,
          borrowing24hVolume,

          totalFeesEarned: lendingItem?.interestEarned ?? 0,
          collateralFactor: storage.collateral_ratio / 10,
          reserveFactor: reserve_ratio / 100,
          reserveAmount: reserveAmount,
          borrowAPR: borrowAPR,
          lendingAPY: lendAPY,
        })

        return acc
      },
      Promise.resolve([]),
    )

    return {
      loanTokens,
      chartsData: getChartData(storage?.history_data, dipDupData, feeds),
      config,
    }
  } catch (e) {
    console.log('normalizeLoans error:', e)
    return {
      chartsData: getChartData(storage?.history_data, dipDupData, feeds),
      loanTokens: [],
      config,
    }
  }
}

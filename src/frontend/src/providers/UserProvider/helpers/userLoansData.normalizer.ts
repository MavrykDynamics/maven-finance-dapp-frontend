import { calcLendingAPY } from 'providers/LoansProvider/helpers/loans.utils'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getVaultCollateralBalance } from 'providers/VaultsProvider/helpers/vaults.utils'
import { GetUserLoansDataQuery } from 'utils/__generated__/graphql'
import { convertNumberForClient } from 'utils/calcFunctions'
import { UserLoansData } from '../user.provider.types'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'

export const normalizeUserLoansData = (
  indexerData: GetUserLoansDataQuery,
  tokensMetadata: TokensContext['tokensMetadata'],
  tokensPrices: TokensContext['tokensPrices'],
) => {
  const { userLendings, totalUserLended, userBorrowings, totalUserBorrowed } =
    indexerData.mavryk_user[0].lending_controller_history_data_sender?.reduce<Omit<UserLoansData, 'userVaultsData'>>(
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
        const token = getTokenDataByAddress({
          tokenAddress: loan_token?.token.token_address,
          tokensMetadata,
          tokensPrices,
        })
        if (!token || !token.rate || !loan_token) return acc

        const { decimals: tokenDecimals, address, rate } = token

        const commonUserData = {
          id,
          date: timestamp,
          tokenAddress: address,
          operationHash: operation_hash,
          annualPecentage: calcLendingAPY(
            convertNumberForClient({ number: loan_token.utilisation_rate, grade: interest_rate_decimals }),
            convertNumberForClient({ number: loan_token.current_interest_rate, grade: interest_rate_decimals }),
            convertNumberForClient({ number: interest_treasury_share, grade: decimals }),
          ),
        }

        const convertedAmount = convertNumberForClient({ number: amount, grade: tokenDecimals })

        switch (type) {
          // add liquidity
          case 0:
            acc.userLendings.push({
              ...commonUserData,
              amount: convertedAmount,
            })
            acc.totalUserLended += convertedAmount * rate
            break
          // remove liquidity
          case 1:
            acc.userLendings.push({
              ...commonUserData,
              amount: -convertedAmount,
            })
            acc.totalUserLended -= convertedAmount * rate
            break
          // borrow
          case 2:
            acc.userBorrowings.push({
              ...commonUserData,
              amount: convertedAmount,
            })
            acc.totalUserBorrowed += convertedAmount * rate
            break
          // repay
          case 3:
            acc.userBorrowings.push({
              ...commonUserData,
              amount: -convertedAmount,
            })
            acc.totalUserBorrowed -= convertedAmount * rate
            break
        }

        return acc
      },
      { userBorrowings: [], totalUserBorrowed: 0, userLendings: [], totalUserLended: 0 },
    ) ?? { userBorrowings: [], totalUserBorrowed: 0, userLendings: [], totalUserLended: 0 }

  const userVaultsData =
    indexerData.mavryk_user[0].lending_controller_vaults?.reduce<UserLoansData['userVaultsData']>(
      (acc, { collateral_balances, loan_token, loan_principal_total, loan_interest_total }) => {
        const borrowedToken = getTokenDataByAddress({
          tokenAddress: loan_token?.token.token_address,
          tokensMetadata,
          tokensPrices,
        })
        if (!borrowedToken || !borrowedToken.rate) return acc

        const { decimals: vaultTokenDecimals, rate: vaultTokenRate } = borrowedToken

        const convertedBorrowedAmount =
          convertNumberForClient({ number: loan_principal_total, grade: vaultTokenDecimals }) * vaultTokenRate
        const convertedInterestAmount =
          convertNumberForClient({ number: loan_interest_total, grade: vaultTokenDecimals }) * vaultTokenRate

        const collateralAmount = getVaultCollateralBalance(
          collateral_balances.map(
            ({
              balance,
              collateral_token: {
                token: { token_address },
              },
            }) => ({ amount: balance, tokenAddress: token_address }),
          ),
          tokensMetadata,
          tokensPrices,
        )

        const isVaultBorrowed = convertedBorrowedAmount > 0 || convertedInterestAmount > 0

        if (!acc[borrowedToken.address]) {
          acc[borrowedToken.address] = {
            principal: convertedBorrowedAmount,
            collateralBalance: collateralAmount,
            interest: convertedInterestAmount,
            borrowedVaultsCollateralBalance: isVaultBorrowed ? collateralAmount : 0,
          }
        } else {
          acc[borrowedToken.address].principal += convertedBorrowedAmount
          acc[borrowedToken.address].collateralBalance += collateralAmount
          acc[borrowedToken.address].interest += convertedInterestAmount
          acc[borrowedToken.address].borrowedVaultsCollateralBalance += isVaultBorrowed ? collateralAmount : 0
        }

        return acc
      },
      {},
    ) ?? {}

  return {
    userVaultsData,
    userBorrowings,
    userLendings,
    totalUserBorrowed,
    totalUserLended,
  }
}

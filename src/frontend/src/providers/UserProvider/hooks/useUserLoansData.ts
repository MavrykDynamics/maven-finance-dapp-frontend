import { useState } from 'react'
import { useSubscription } from '@apollo/client'

import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

import { GET_USER_LOANS_DATA } from '../queries/userLoans.query'
import { calcLendingAPY } from 'pages/Loans/Loans.helpers'
import { convertNumberForClient } from 'utils/calcFunctions'

import { UserLoansDataStateType } from '../helpers/user.types'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

const useUserLoansData = ({ userAddress }: { userAddress?: string }) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const [userLoansData, setUserLoansData] = useState<UserLoansDataStateType>({
    userBorrowings: [],
    totalUserBorrowed: 0,
    userLendings: [],
    totalUserLended: 0,
    userVaultsData: {},
  })

  const { loading: isLoading } = useSubscription(GET_USER_LOANS_DATA, {
    skip: !userAddress,
    variables: {
      userAddress,
    },
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      const { userLendings, totalUserLended, userBorrowings, totalUserBorrowed } =
        data.mavryk_user[0].lending_controller_history_data_sender?.reduce<{
          userLendings: UserLoansDataStateType['userLendings']
          totalUserLended: UserLoansDataStateType['totalUserLended']
          userBorrowings: UserLoansDataStateType['userBorrowings']
          totalUserBorrowed: UserLoansDataStateType['totalUserBorrowed']
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
                convertNumberForClient({ number: loan_token.current_interest_rate, grade: interest_rate_decimals }),
                convertNumberForClient({ number: interest_treasury_share, grade: decimals }),
              ),
            }

            const convetredAmount = convertNumberForClient({ number: amount, grade: tokenDecimals })

            switch (type) {
              case 0:
                acc.userLendings.push({
                  ...commonUserData,
                  amount: convetredAmount,
                })
                acc.totalUserLended += convetredAmount * rate
                break
              case 1:
                acc.userLendings.push({
                  ...commonUserData,
                  amount: -convetredAmount,
                })
                acc.totalUserLended -= convetredAmount * rate
                break
              case 2:
                acc.userBorrowings.push({
                  ...commonUserData,
                  amount: convetredAmount,
                })
                acc.totalUserBorrowed += convetredAmount * rate
                break
              case 3:
                acc.userBorrowings.push({
                  ...commonUserData,
                  amount: -convetredAmount,
                })
                acc.totalUserBorrowed -= convetredAmount * rate
                break
            }

            return acc
          },
          { userBorrowings: [], totalUserBorrowed: 0, userLendings: [], totalUserLended: 0 },
        ) ?? { userBorrowings: [], totalUserBorrowed: 0, userLendings: [], totalUserLended: 0 }

      const userVaultsData =
        data.mavryk_user[0].lending_controller_vaults?.reduce<UserLoansDataStateType['userVaultsData']>(
          (acc, { collateral_balances, loan_token, loan_principal_total }) => {
            const borrowedToken = getTokenDataByAddress({
              tokenAddress: loan_token?.token.token_address,
              tokensMetadata,
              tokensPrices,
            })
            if (!borrowedToken || !borrowedToken.rate) return acc

            const { decimals: vaultTokenDecimals, rate: vaultTokenRate } = borrowedToken

            const collateralAmount = collateral_balances.reduce((acc, { balance, collateral_token: { token } }) => {
              const collateralToken = getTokenDataByAddress({
                tokenAddress: token?.token_address,
                tokensMetadata,
                tokensPrices,
              })
              if (!collateralToken || !collateralToken.rate) return acc
              const { decimals: collateralTokenDecimals, rate: collateralTokenRate } = collateralToken

              acc += convertNumberForClient({ number: balance, grade: collateralTokenDecimals }) * collateralTokenRate
              return acc
            }, 0)

            acc[borrowedToken.address] = {
              borrowedAmount:
                convertNumberForClient({ number: loan_principal_total, grade: vaultTokenDecimals }) * vaultTokenRate,
              collateralAmount,
            }

            return acc
          },
          {},
        ) ?? {}

      setUserLoansData({ userLendings, userBorrowings, userVaultsData, totalUserLended, totalUserBorrowed })
    },
    onError: (error) => {
      console.error('GET_USER_LOANS_DATA error: ', { error })
    },
  })

  return { isLoading, ...userLoansData }
}

export default useUserLoansData

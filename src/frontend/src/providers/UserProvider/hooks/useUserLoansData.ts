import { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/client'

import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

import { GET_USER_LOANS_DATA } from '../queries/userLoans.query'
import { calcLendingAPY } from 'providers/LoansProvider/helpers/loans.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getVaultCollateralBalance } from 'providers/VaultsProvider/helpers/vaults.utils'
import { GetUserLoansDataSubscription } from 'utils/__generated__/graphql'
import { UserLoansDataStateType } from '../user.provider.types'

/**
 *
 * @param param0.userAddress – address of the current user to get his lend/borrow data
 * @returns returns user's loans data, all values are converted, this data is used to show his loans stats
 */
const useUserLoansData = ({ userAddress }: { userAddress: string | null }) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const [userLoansData, setUserLoansData] = useState<UserLoansDataStateType>({
    userBorrowings: [],
    totalUserBorrowed: 0,
    userLendings: [],
    totalUserLended: 0,
    userVaultsData: {},
  })

  const [indexerData, setIndexerData] = useState<GetUserLoansDataSubscription | null>(null)

  useEffect(() => {
    if (!indexerData) return

    const { userLendings, totalUserLended, userBorrowings, totalUserBorrowed } =
      indexerData.mavryk_user[0].lending_controller_history_data_sender?.reduce<{
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
      indexerData.mavryk_user[0].lending_controller_vaults?.reduce<UserLoansDataStateType['userVaultsData']>(
        (acc, { collateral_balances, loan_token, loan_principal_total }) => {
          const borrowedToken = getTokenDataByAddress({
            tokenAddress: loan_token?.token.token_address,
            tokensMetadata,
            tokensPrices,
          })
          if (!borrowedToken || !borrowedToken.rate) return acc

          const { decimals: vaultTokenDecimals, rate: vaultTokenRate } = borrowedToken

          const convertedBorrowedAmount =
            convertNumberForClient({ number: loan_principal_total, grade: vaultTokenDecimals }) * vaultTokenRate

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
          const isVaultBorrowed = convertedBorrowedAmount > 0

          if (!acc[borrowedToken.address]) {
            acc[borrowedToken.address] = {
              borrowedAmount: convertedBorrowedAmount,
              borrowedVaultsCollateralAmount: isVaultBorrowed ? collateralAmount : 0,
              allVaultsCollateralAmount: collateralAmount,
            }
          } else {
            acc[borrowedToken.address].borrowedAmount += convertedBorrowedAmount
            acc[borrowedToken.address].borrowedVaultsCollateralAmount += isVaultBorrowed ? collateralAmount : 0
            acc[borrowedToken.address].allVaultsCollateralAmount += collateralAmount
          }

          return acc
        },
        {},
      ) ?? {}

    setUserLoansData({ userLendings, userBorrowings, userVaultsData, totalUserLended, totalUserBorrowed })
  }, [indexerData, tokensMetadata, tokensPrices])

  const { loading: isLoading } = useSubscription(GET_USER_LOANS_DATA, {
    skip: !userAddress,
    variables: {
      userAddress,
    },
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      setIndexerData(data)
    },
    onError: (error) => {
      console.error('GET_USER_LOANS_DATA error: ', { error })
    },
  })

  return { isLoading, ...userLoansData }
}

export default useUserLoansData

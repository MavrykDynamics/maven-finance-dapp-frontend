import {
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { InputProps, Settings } from 'app/App.components/Input/newInput.type'
import BigNumber from 'bignumber.js'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import {
  calculateAccruedInterest,
  getLoansInputMaxAmount,
  getMaxBorrowAmountFromBorrowCapacity,
  loansInputValidation,
} from 'pages/Loans/Loans.helpers'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { useUserContext } from 'providers/UserProvider/user.provider'
import React, { useCallback, useMemo, useState } from 'react'
import { checkNan } from 'utils/checkNan'

/**
 * used only for borrow input
 * @param borrowedAssetAddress borrowed asset address taken fromn vault object
 * @param borrowCapacity borrow capacity take from vault object
 * @returns default data that is used for stats and other calculations
 */
export const useBorrowInputData = ({
  borrowedAssetAddress,
  borrowCapacity,
  vaultBorrowIndex,
  marketBorrowIndex,
  isCreateVaultBorrow,
  interest,
}: {
  borrowedAssetAddress: string
  borrowCapacity: BigNumber
  vaultBorrowIndex: number
  marketBorrowIndex: number
  isCreateVaultBorrow?: boolean
  interest?: number
}) => {
  const { userTokensBalances } = useUserContext()

  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { symbol, decimals, icon } = tokensMetadata[borrowedAssetAddress]
  const rate = tokensPrices[symbol]

  const [inputData, setInputData] = useState<{
    amount: string
    validationStatus: InputStatusType
  }>({
    amount: '0',
    validationStatus: INPUT_STATUS_DEFAULT,
  })
  const inputAmount = checkNan(parseFloat(inputData.amount))

  const userAssetBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: borrowedAssetAddress })

  /**
   * maxBorrowValue pure amount in tokens how much user will be able to borrow, value in input,
   * but we also need to note, that user will borrow value from input + interest from this value,
   * so value in input should be borrowCapacity - interest,
   * but when we creating vault we don't have interest yet, so we can borrow whole borrowCapacity amount
   */
  const maxBorrowValue = borrowCapacity.dividedBy(rate).decimalPlaces(decimals) //Math.max(isCreateVaultBorrow ? borrowCapacity / rate : borrowCapacity / rate, 0)

  console.log('use input max:', {
    borrowCapacityUSD: borrowCapacity,
    rate,
    borrowCapacityToken: maxBorrowValue,
  })

  // stuff to handle inputs
  const clearData = useCallback(() => {
    setInputData({
      amount: '0',
      validationStatus: INPUT_STATUS_DEFAULT,
    })
  }, [])

  const inputOnChangeHandle = useCallback(
    (newInputAmount: string, maxAmount: number) => {
      const validationStatus = loansInputValidation({
        inputAmount: newInputAmount,
        maxAmount,
        options: {
          byDecimalPlaces: decimals || assetDecimalsToShow,
        },
      })

      setInputData({
        ...inputData,
        amount: newInputAmount,
        validationStatus: validationStatus,
      })
    },
    [decimals, inputData],
  )

  const inputOnBlurHandle = useCallback(() => {
    setInputData({
      ...inputData,
      amount: getOnBlurValue(inputData.amount),
    })
  }, [inputData])

  const onFocusHandler = useCallback(() => {
    setInputData({
      ...inputData,
      amount: getOnFocusValue(inputData.amount),
    })
  }, [inputData])

  const inputProps: InputProps = useMemo(
    () => ({
      value: inputData.amount,
      type: 'number',
      onBlur: inputOnBlurHandle,
      onFocus: onFocusHandler,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        inputOnChangeHandle(e.target.value, maxBorrowValue.toNumber()),
    }),
    [inputData.amount, inputOnBlurHandle, onFocusHandler, inputOnChangeHandle, maxBorrowValue],
  )

  const settings: Settings = useMemo(
    () => ({
      balance: userAssetBalance,
      balanceAsset: symbol,
      balanceName: 'Wallet Balance',
      useMaxHandler: () => inputOnChangeHandle(maxBorrowValue.toString(), maxBorrowValue.toNumber()),
      inputStatus: inputData.validationStatus,
      convertedValue: inputAmount * rate,
      inputSize: INPUT_LARGE,
    }),
    [
      userAssetBalance,
      symbol,
      inputData.validationStatus,
      inputAmount,
      rate,
      inputOnChangeHandle,
      maxBorrowValue,
      decimals,
    ],
  )

  const borrowInputProperties = useMemo(
    () => ({
      settings,
      inputProps,
      rate,
      icon,
      symbol,
      clearData,
      decimals,
      inputData,
    }),
    [clearData, decimals, icon, inputProps, rate, settings, symbol, inputData],
  )

  return borrowInputProperties
}

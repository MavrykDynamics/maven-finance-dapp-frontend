import {
  ERR_MSG_TOAST,
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { InputProps, Settings } from 'app/App.components/Input/newInput.type'
import { validateInputLength } from 'app/App.utils/input/validateInput'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import { getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { useUserContext } from 'providers/UserProvider/user.provider'
import React, { useCallback, useMemo, useState } from 'react'
import { checkNan } from 'utils/checkNan'

export const useBorrowInputData = (borrowedAssetAddress = '', borrowCapacity = 0) => {
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

      console.log(validationStatus)

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
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => inputOnChangeHandle(e.target.value, borrowCapacity / rate),
    }),
    [borrowCapacity, rate, inputData.amount, inputOnBlurHandle, inputOnChangeHandle, onFocusHandler],
  )

  const settings: Settings = useMemo(
    () => ({
      balance: userAssetBalance,
      balanceAsset: symbol,
      balanceName: 'Wallet Balance',
      useMaxHandler: () =>
        inputOnChangeHandle(getLoansInputMaxAmount(borrowCapacity / rate, decimals), borrowCapacity / rate),
      inputStatus: inputData.validationStatus,
      convertedValue: inputAmount * rate,
      inputSize: INPUT_LARGE,
      validationFns: [[validateInputLength, ERR_MSG_TOAST]],
    }),
    [
      userAssetBalance,
      symbol,
      inputData.validationStatus,
      inputAmount,
      rate,
      inputOnChangeHandle,
      borrowCapacity,
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

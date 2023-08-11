import { useCallback, useMemo, useState } from 'react'

// utils
import { getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// hooks
import { useXTZMaxAmountValidator } from './useXTZMaxValidator'

// consts
import {
  INPUT_STATUS_DEFAULT,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'

// types
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { DDItemId } from 'app/App.components/DropDown/NewDropdown'

/**
 * @returns collateral data to handle input stuff && XTZ max amount validation data
 */
export const useCollateralInputData = (ignoreXTZMax = false) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const [selectedCollateral, setSelectedCollateral] = useState<TokenAddressType | undefined>()
  const [inputData, setInputData] = useState<{
    amount: string
    validationStatus: InputStatusType
  }>({
    amount: '0',
    validationStatus: '',
  })

  const collateralToken = getTokenDataByAddress({
    tokenAddress: selectedCollateral,
    tokensMetadata,
    tokensPrices,
  })

  const { decimals = 0 } = collateralToken ?? {}

  const selectedCollateralObj = useMemo(
    () =>
      selectedCollateral
        ? {
            [selectedCollateral]: {
              amount: inputData.amount,
              validation: inputData.validationStatus,
            },
          }
        : null,
    [inputData.amount, inputData.validationStatus, selectedCollateral],
  )

  const { isTezosToken, updateMaxedXTZData, ...rest } = useXTZMaxAmountValidator(
    [selectedCollateral ?? ''],
    selectedCollateralObj,
  )

  const clearData = useCallback(() => {
    setInputData({
      amount: '0',
      validationStatus: INPUT_STATUS_DEFAULT,
    })
  }, [])

  const inputOnChangeHandle = useCallback(
    (newInputAmount: string, userAssetBalance: number) => {
      const validationStatus = loansInputValidation({
        inputAmount: newInputAmount,
        maxAmount: isTezosToken && !ignoreXTZMax ? userAssetBalance - 1 : userAssetBalance,
        options: {
          byDecimalPlaces: decimals ?? assetDecimalsToShow,
        },
      })

      console.log(validationStatus)

      if (inputData) {
        setInputData({
          ...inputData,
          amount: newInputAmount,
          validationStatus: validationStatus,
        })
      }
    },
    [decimals, ignoreXTZMax, inputData, isTezosToken],
  )

  const inputOnBlurHandle = useCallback(
    () =>
      setInputData({
        ...inputData,
        amount: getOnBlurValue(inputData.amount),
      }),
    [inputData],
  )

  const onFocusHandler = useCallback(
    () =>
      setInputData({
        ...inputData,
        amount: getOnFocusValue(inputData.amount),
      }),
    [inputData],
  )

  const clickOnInputDDItem = useCallback((id: DDItemId) => {
    if (typeof id === 'string') {
      setSelectedCollateral(id)
    }
    setInputData({ amount: '0', validationStatus: INPUT_STATUS_DEFAULT })
  }, [])

  const useMaxHandler = useCallback(
    (userCollateralBalance: number) => {
      const condition = isTezosToken && !ignoreXTZMax
      const maxAmount = getLoansInputMaxAmount(userCollateralBalance, decimals)
      const _amount = condition ? String(+maxAmount - 1) : maxAmount

      if (condition) updateMaxedXTZData(Number(_amount))
      inputOnChangeHandle(_amount, userCollateralBalance)
    },
    [decimals, ignoreXTZMax, inputOnChangeHandle, isTezosToken, updateMaxedXTZData],
  )

  return {
    isTezosToken,
    updateMaxedXTZData,
    selectedCollateral,
    setSelectedCollateral,
    inputData,
    setInputData,
    inputOnChangeHandle,
    inputOnBlurHandle,
    onFocusHandler,
    clickOnInputDDItem,
    useMaxHandler,
    clearData,
    ...rest,
  }
}

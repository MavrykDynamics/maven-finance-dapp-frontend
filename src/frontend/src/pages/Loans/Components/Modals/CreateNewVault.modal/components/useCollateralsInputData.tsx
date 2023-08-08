import { DDItemId } from 'app/App.components/DropDown/NewDropdown'
import {
  INPUT_STATUS_DEFAULT,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { useCallback, useMemo, useState } from 'react'
import { useXTZMaxAmountValidator } from './useXTZMaxValidator'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'

export const useCollateralsInputData = () => {
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

  const inputOnChangeHandle = useCallback(
    (newInputAmount: string, userAssetBalance: number) => {
      const validationStatus = loansInputValidation({
        inputAmount: newInputAmount,
        maxAmount: isTezosToken ? userAssetBalance - 1 : userAssetBalance,
        options: {
          byDecimalPlaces: decimals ?? assetDecimalsToShow,
        },
      })

      if (inputData) {
        setInputData({
          ...inputData,
          amount: newInputAmount,
          validationStatus: validationStatus,
        })
      }
    },
    [decimals, inputData, isTezosToken],
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
      const maxAmount = getLoansInputMaxAmount(userCollateralBalance, decimals)
      const _amount = isTezosToken ? String(+maxAmount - 1) : maxAmount

      if (isTezosToken) updateMaxedXTZData(Number(_amount))
      inputOnChangeHandle(_amount, userCollateralBalance)
    },
    [decimals, inputOnChangeHandle, isTezosToken, updateMaxedXTZData],
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
    ...rest,
  }
}

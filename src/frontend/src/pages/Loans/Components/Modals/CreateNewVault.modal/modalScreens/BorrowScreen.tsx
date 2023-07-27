import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import classNames from 'classnames'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import {
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { checkNan } from 'utils/checkNan'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'
import { useCreateVaultContext } from '../helpers/createVaultModalContext'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import colors, { silverColor } from 'styles/colors'
import { BorrowScreenWrapper } from '../createNewVault.style'
import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { getCollateralRatioByPersentage, getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { useFullVault } from 'providers/VaultsProvider/hooks/useFullVault'
import { InputProps, Settings } from 'app/App.components/Input/newInput.type'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import NewButton from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { CONFIRMATION_SCREEN_ID } from '../helpers/createNewVault.consts'
import Icon from 'app/App.components/Icon/Icon.view'
import { BorrowScreenBottomStats } from '../components/BorrowScreenBottomStats'

export const BorrowScreen = () => {
  const {
    preferences: { themeSelected },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const { userTokensBalances } = useUserContext()
  const { newVault, updateScreenToShow } = useCreateVaultContext()
  const { vaultsMapper } = useVaultsContext()
  const {
    config: { daoFee },
  } = useLoansContext()

  const currentVault = vaultsMapper[newVault?.id.toString() ?? '']
  // TODO replace with NewVault data from modal screens context
  const vaultData = useFullVault(currentVault)

  const {
    borrowedTokenAddress: borrowedAssetAddress = '',
    borrowCapacity = 0,
    borrowedAmount: currentBorrowedAmount = 0,
    collateralBalance: currentCollateralBalance = 0,
  } = vaultData ?? {}

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
  const isDisabledButton = inputData.validationStatus === INPUT_STATUS_ERROR || inputAmount === 0 || isActionActive

  const userAssetBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: borrowedAssetAddress })

  // -------------------------------------------------------------------------------------

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = getVaultCollateralRatio(
      currentCollateralBalance,
      (currentBorrowedAmount + inputAmount) * rate,
    )

    const futureBorrowCapacity = borrowCapacity - inputAmount * rate

    return { futureCollateralRatio, futureBorrowCapacity }
  }, [currentCollateralBalance, currentBorrowedAmount, inputAmount, rate, borrowCapacity])

  const clearData = () => {
    setInputData({
      amount: '0',
      validationStatus: INPUT_STATUS_DEFAULT,
    })
  }

  // stuff to handle inputs
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
  // -------------------------------------------------------------------------------------

  // TODO sxtract to custom hook (same code <BorrowingExpandCardBorrowSection />)
  return (
    <BorrowScreenWrapper>
      <div className="borrow-screen-top-stats">
        <ThreeLevelListItem>
          <div className="name">
            Borrow Capacity
            <CustomTooltip
              iconId="info"
              defaultStrokeColor={colors[themeSelected].textColor}
              text={'tooltip text'}
              className="tooltip"
            />
          </div>
          <CommaNumber value={132916489} decimalsToShow={0} className="value" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Collateral Utilization</div>
          <div className="value">Not Relevant</div>
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Borrow APR</div>
          <CommaNumber value={22.5} decimalsToShow={2} className="value" endingText="%" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">
            DAO Fee
            <CustomTooltip
              iconId="info"
              defaultStrokeColor={colors[themeSelected].textColor}
              text={'tooltip text'}
              className="tooltip"
            />
          </div>
          <CommaNumber value={daoFee} decimalsToShow={2} className="value" endingText="%" />
        </ThreeLevelListItem>
      </div>

      <div className="borrow-screen-input-wrapper">
        <div className="block-name">Select the amount to borrow</div>

        <Input
          className={classNames('pinned-dropdown', { 'input-with-rate': rate })}
          inputProps={inputProps}
          settings={settings}
        >
          <InputPinnedTokenInfo>
            <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> {symbol}
          </InputPinnedTokenInfo>
        </Input>
      </div>
      <BorrowScreenBottomStats
        inputAmount={inputAmount}
        assetDecimalsToShow={assetDecimalsToShow}
        daoFee={daoFee}
        futureCollateralRatio={futureCollateralRatio}
        futureBorrowCapacity={futureBorrowCapacity}
        headerText="New Vault stats"
      />

      <div className="manage-btn">
        <NewButton
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          onClick={() => {
            clearData()
            updateScreenToShow(CONFIRMATION_SCREEN_ID)
          }}
          disabled={isDisabledButton}
        >
          Borrow
          <Icon id="arrowRight" />
        </NewButton>
      </div>
    </BorrowScreenWrapper>
  )
}

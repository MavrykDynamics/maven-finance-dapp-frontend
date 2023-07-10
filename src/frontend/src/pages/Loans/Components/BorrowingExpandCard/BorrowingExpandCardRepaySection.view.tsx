import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import classNames from 'classnames'
import { VaultOverview, StatusMessageStyled } from '../LoansComponents.style'
import {
  COLLATERAL_RATIO_GRADIENT,
  assetDecimalsToShow,
  getCollateralRationPersent,
  loansTabNames,
} from 'pages/Loans/Loans.const'
import { getCollateralRatioByPersentage, getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { State } from 'reducers'
import {
  INPUT_LARGE,
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  InputStatusType,
  getOnBlurValue,
  getOnFocusValue,
} from 'app/App.components/Input/Input.constants'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { silverColor } from 'styles'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import colors from 'styles/colors'
import { TabItem } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { InputProps, Settings } from 'app/App.components/Input/newInput.type'
import { CONTRACT_COMPLIANT_REPAYMENT_ADJUST_AND_REFUND, PARTIAL_LOAN_REPAYMENT } from 'texts/banners/vault.text'
import { AVALIABLE_TO_BORROW, FEES_DUE } from 'texts/tooltips/vault.text'
import { checkNan } from 'utils/checkNan'
import { TokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getVaultCollateralRatio } from 'providers/LoansProvider/helpers/vaults.utils'
import { usePreferencesContext } from 'providers/PreferencesProvider/preferences.provider'

type Props = {
  vaultId: number
  vaultAddress: string
  borrowedToken: TokenMetadataType
  borrowedTokenRate: number
  fee: number
  borrowedAmount: number
  minimumRepay: number
  collateralBalance: number
  borrowCapacity: number
  activeRepayTab?: TabItem
  openConfirmRepayPopup: (inputAmount: number, callback: () => void) => void
  openConfirmRepayFullPopup: (callback: () => void) => void
}

export const BorrowingExpandCardRepaySection = (props: Props) => {
  const { userTokensBalances } = useUserContext()

  const { themeSelected } = usePreferencesContext()
  const { isActionActive } = useSelector((state: State) => state.loading)

  const {
    vaultId,
    vaultAddress,
    fee,
    borrowedToken,
    collateralBalance,
    borrowedTokenRate,
    borrowCapacity,
    minimumRepay,
    borrowedAmount,
    activeRepayTab,
    openConfirmRepayPopup,
    openConfirmRepayFullPopup,
  } = props

  const { decimals, symbol, icon } = borrowedToken

  const [inputData, setInputData] = useState<{
    amount: string
    validationStatus: InputStatusType
  }>({
    amount: '0',
    validationStatus: INPUT_STATUS_DEFAULT,
  })
  const inputAmount = checkNan(parseFloat(inputData.amount))

  const totalOutstanding = fee + borrowedAmount
  const userAssetBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: borrowedToken.address })

  const isRepayInFull = activeRepayTab?.id === loansTabNames.REPAY_IN_FULL
  // TODO: calc warnings on validation, not here
  const isMinimumRepayWarning =
    inputData.validationStatus === INPUT_STATUS_ERROR &&
    inputAmount <= minimumRepay &&
    totalOutstanding !== 0 &&
    inputData.amount !== ''
  const isNotRepayInFullWarning = isRepayInFull && totalOutstanding !== inputAmount

  const futureBorrowedAmount = borrowedAmount - inputAmount < 0 ? 0 : borrowedAmount - inputAmount
  const futureTotalOutstanding = totalOutstanding - inputAmount < 0 ? 0 : totalOutstanding - inputAmount
  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = getVaultCollateralRatio(
      collateralBalance,
      (borrowedAmount - inputAmount) * borrowedTokenRate,
    )

    const futureBorrowCapacity = Math.max(borrowCapacity + inputAmount, 0)
    return { futureCollateralRatio, futureBorrowCapacity }
  }, [collateralBalance, borrowedAmount, inputAmount, borrowedTokenRate, borrowCapacity])

  const clearData = () => {
    setInputData({
      amount: '0',
      validationStatus: INPUT_STATUS_DEFAULT,
    })
  }

  const inputOnChangeHandle = useCallback(
    (newInputAmount: string, maxAmount: number) => {
      const validationStatus = loansInputValidation({
        inputAmount: newInputAmount,
        maxAmount,
        minAmount: minimumRepay,
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
    [decimals, inputData, minimumRepay],
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

  const handleClickRepay = async () => {
    if (vaultId && vaultAddress) {
      isRepayInFull && !isNotRepayInFullWarning
        ? openConfirmRepayFullPopup(clearData)
        : openConfirmRepayPopup(inputAmount, clearData)
    }
  }

  useEffect(() => {
    if (isRepayInFull) {
      const validationStatus =
        totalOutstanding !== 0
          ? loansInputValidation({
              inputAmount: String(totalOutstanding),
              maxAmount: Math.min(userAssetBalance, totalOutstanding),
              minAmount: minimumRepay,
              options: {
                byDecimalPlaces: decimals || assetDecimalsToShow,
              },
            })
          : ''

      setInputData({
        amount: String(totalOutstanding),
        validationStatus,
      })
    } else {
      setInputData({
        amount: '0',
        validationStatus: INPUT_STATUS_DEFAULT,
      })
    }
  }, [activeRepayTab, decimals, isRepayInFull, minimumRepay, totalOutstanding, userAssetBalance])

  const inputProps: InputProps = useMemo(
    () => ({
      value: inputData.amount,
      type: 'number',
      onBlur: inputOnBlurHandle,
      onFocus: onFocusHandler,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        inputOnChangeHandle(e.target.value, Math.min(userAssetBalance, totalOutstanding)),
    }),
    [inputData.amount, inputOnBlurHandle, inputOnChangeHandle, onFocusHandler, totalOutstanding, userAssetBalance],
  )

  const settings: Settings = useMemo(
    () => ({
      balance: userAssetBalance,
      balanceAsset: symbol,
      balanceName: 'Wallet Balance',
      useMaxHandler: () =>
        inputOnChangeHandle(
          getLoansInputMaxAmount(Math.min(userAssetBalance, totalOutstanding), decimals),
          Math.min(userAssetBalance, totalOutstanding),
        ),
      inputStatus: inputData.validationStatus,
      convertedValue: inputAmount * borrowedTokenRate,
      inputSize: INPUT_LARGE,
    }),
    [
      symbol,
      inputData.validationStatus,
      inputAmount,
      borrowedTokenRate,
      inputOnChangeHandle,
      userAssetBalance,
      totalOutstanding,
      decimals,
    ],
  )

  return (
    <>
      {isRepayInFull && <div className="coming-soon">Coming Soon</div>}

      <div>
        <div className="tab-text">Select Amount to Repay</div>

        <Input
          className={classNames('pinned-dropdown', { 'input-with-borrowedTokenRate': borrowedTokenRate })}
          inputProps={inputProps}
          settings={settings}
        >
          <InputPinnedTokenInfo>
            <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> {symbol}
          </InputPinnedTokenInfo>
        </Input>
      </div>

      {isMinimumRepayWarning ? (
        <StatusMessageStyled className={`${vaultsStatuses.LIQUIDATABLE}`}>
          <Icon id="error-triangle" />
          {CONTRACT_COMPLIANT_REPAYMENT_ADJUST_AND_REFUND}
        </StatusMessageStyled>
      ) : null}

      {isNotRepayInFullWarning ? (
        <StatusMessageStyled className="repay-in-full">
          <Icon id="info" />
          {PARTIAL_LOAN_REPAYMENT}
        </StatusMessageStyled>
      ) : null}

      <div className={!isMinimumRepayWarning ? 'mt-25' : ''}>
        <div className="tab-text mb-10">Updated Repay {symbol} Stats</div>
        <VaultOverview>
          <div className="line">
            <ThreeLevelListItem>
              <div className="name">Borrowed</div>
              <CommaNumber value={futureBorrowedAmount} className="value" />
            </ThreeLevelListItem>

            <ThreeLevelListItem>
              <div className="name">
                Fees Due
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={colors[themeSelected].textColor}
                  text={FEES_DUE(fee)}
                  className="tooltip"
                />
              </div>
              <CommaNumber value={Math.ceil(fee)} decimalsToShow={0} className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Total Outstanding</div>
              <CommaNumber value={futureTotalOutstanding} className="value" showDecimal decimalsToShow={2} />
            </ThreeLevelListItem>
            <ThreeLevelListItem className="right">
              <div className="name">Collateral Value</div>
              <CommaNumber value={collateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </div>

          <div className="line">
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(futureCollateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio:
                <CommaNumber value={futureCollateralRatio} endingText="%" showDecimal decimalsToShow={2} />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={getCollateralRatioByPersentage(futureCollateralRatio)}
              />
            </ThreeLevelListItem>

            <ThreeLevelListItem className="right">
              <div className="name">
                Available To Borrow
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={silverColor}
                  text={AVALIABLE_TO_BORROW}
                  className="tooltip"
                />
              </div>
              <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </div>
        </VaultOverview>
      </div>

      <div className="button-wrapper">
        <NewButton
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          onClick={handleClickRepay}
          disabled={
            inputData.validationStatus === INPUT_STATUS_ERROR || inputAmount === 0 || isActionActive || isRepayInFull
          }
        >
          <Icon id="okIcon" />
          Repay in {isRepayInFull ? 'Full' : 'Part'}
        </NewButton>
      </div>
    </>
  )
}

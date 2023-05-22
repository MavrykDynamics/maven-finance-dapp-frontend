import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import classNames from 'classnames'
import { VaultOverview, StatusMessageStyled } from '../LoansComponents.style'
import {
  COLLATERAL_RATIO_GRADIENT,
  assetDecimalsToShow,
  getCollateralRationPersent,
  vaultCardTabNames,
} from 'pages/Loans/Loans.const'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import {
  calcCollateralRatio,
  getCollateralRatioByPersentage,
  getLoansInputMaxAmount,
  isTezosAsset,
  loansInputValidation,
} from 'pages/Loans/Loans.helpers'
import { DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue } from '../Modals/Modals.helpers'
import { State } from 'reducers'
import { INPUT_LARGE, INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
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
import { mathRoundTwoDigit } from 'utils/validatorFunctions'
import { InputProps, Settings } from 'app/App.components/Input/newInput.type'
import { CONTRACT_COMPLIANT_REPAYMENT_ADJUST_AND_REFUND, PARTIAL_LOAN_REPAYMENT } from 'texts/statusMessages/vault.text'
import { AVALIABLE_TO_BORROW, FEES_DUE } from 'texts/tooltips/vault.text'

type Props = {
  vaultId: number
  vaultAddress: string
  borrowedAsset: LoansVaultType['borrowedAsset']
  feesAmount: number
  borrowedAmount: number
  minimumRepay: number
  currentCollateralBalance: number
  borrowCapacity: number
  activeRepayTab?: TabItem
  openConfirmRepayPopup: (inputAmount: number) => void
  openConfirmRepayFullPopup: () => void
}

export const BorrowingExpandCardRepaySection = (props: Props) => {
  const { userTokens } = useSelector((state: State) => state.wallet.user)
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const {
    vaultId,
    vaultAddress,
    borrowedAsset,
    feesAmount = 0,
    currentCollateralBalance = 0,
    borrowCapacity = 0,
    minimumRepay = 0,
    borrowedAmount = 0,
    activeRepayTab,
    openConfirmRepayPopup,
    openConfirmRepayFullPopup,
  } = props

  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)
  const parsedAmount = parseFloat(inputData.amount)
  const inputAmount = isNaN(parsedAmount) ? 0 : parsedAmount

  const totalOutstanding = feesAmount + Number(borrowedAmount)
  const balanceSymbol = isTezosAsset(borrowedAsset?.gqlName ?? '') ? 'tezos' : borrowedAsset?.symbol.toLowerCase() ?? ''
  const userAssetBalance = userTokens[balanceSymbol]?.balance ?? 0

  const isRepayInFull = activeRepayTab?.id === vaultCardTabNames.REPAY_IN_FULL
  const isMinimumRepayWarning =
    inputData.validationStatus === INPUT_STATUS_ERROR && inputAmount <= minimumRepay && totalOutstanding !== 0
  const isNotRepayInFullWarning = isRepayInFull && mathRoundTwoDigit(totalOutstanding) !== inputAmount

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = borrowedAsset
      ? calcCollateralRatio(currentCollateralBalance, borrowedAmount - inputAmount, borrowedAsset.rate)
      : 0

    const futureBorrowCapacity = Math.max(borrowCapacity + inputAmount, 0)
    return { futureCollateralRatio, futureBorrowCapacity }
  }, [borrowedAsset, currentCollateralBalance, borrowCapacity, inputAmount, borrowedAmount])

  const inputOnChangeHandle = useCallback(
    (newInputAmount: string, maxAmount: number) => {
      const validationStatus = loansInputValidation({
        inputAmount: newInputAmount,
        maxAmount,
        minAmount: minimumRepay,
        options: {
          byDecimalPlaces: borrowedAsset?.decimals || assetDecimalsToShow,
        },
      })

      setInputData({
        ...inputData,
        amount: newInputAmount,
        validationStatus: validationStatus,
      })
    },
    [borrowedAsset?.decimals, inputData, minimumRepay],
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
    if (vaultId && borrowedAsset && vaultAddress) {
      isRepayInFull && !isNotRepayInFullWarning ? openConfirmRepayFullPopup() : openConfirmRepayPopup(inputAmount)
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
                byDecimalPlaces: borrowedAsset?.decimals || assetDecimalsToShow,
              },
            })
          : ''

      setInputData({
        amount: String(mathRoundTwoDigit(totalOutstanding)),
        validationStatus,
      })
    } else {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
    }
  }, [activeRepayTab, totalOutstanding])

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
      balanceAsset: borrowedAsset?.symbol,
      balanceName: 'Wallet Balance',
      useMaxHandler: () =>
        inputOnChangeHandle(
          getLoansInputMaxAmount(Math.min(userAssetBalance, totalOutstanding), borrowedAsset.decimals),
          Math.min(userAssetBalance, totalOutstanding),
        ),
      inputStatus: inputData.validationStatus,
      convertedValue: inputAmount * borrowedAsset.rate,
      inputSize: INPUT_LARGE,
    }),
    [borrowedAsset, inputAmount, inputData.validationStatus, inputOnChangeHandle, totalOutstanding, userAssetBalance],
  )

  return (
    <>
      {isRepayInFull && <div className="coming-soon">Coming Soon</div>}

      <div>
        <div className="tab-text">Select Amount to Repay</div>

        <Input
          className={classNames('pinned-dropdown', { 'input-with-rate': borrowedAsset.rate })}
          inputProps={inputProps}
          settings={settings}
        >
          <InputPinnedTokenInfo>
            <ImageWithPlug imageLink={borrowedAsset.icon} alt={`${borrowedAsset.symbol} icon`} />{' '}
            {borrowedAsset?.symbol}
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
        <div className="tab-text mb-10">Updated Repay {borrowedAsset?.symbol} Stats</div>
        <VaultOverview>
          <div className="line">
            <ThreeLevelListItem>
              <div className="name">Borrowed</div>
              <CommaNumber value={borrowedAmount} className="value" />
            </ThreeLevelListItem>

            <ThreeLevelListItem>
              <div className="name">
                Fees Due
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={colors[themeSelected].textColor}
                  text={FEES_DUE(feesAmount)}
                  className="tooltip"
                />
              </div>
              <CommaNumber value={Math.ceil(feesAmount)} decimalsToShow={0} className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Total Outstanding</div>
              <CommaNumber value={mathRoundTwoDigit(totalOutstanding) || 0} className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem className="right">
              <div className="name">Collateral Value</div>
              <CommaNumber value={currentCollateralBalance} className="value" beginningText="$" />
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

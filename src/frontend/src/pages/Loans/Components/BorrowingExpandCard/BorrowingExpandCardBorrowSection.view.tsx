import { useCallback, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import classNames from 'classnames'
import { VaultOverview, StatusMessageStyled } from '../LoansComponents.style'
import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
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
import { BUTTON_PRIMARY, BUTTON_PULSE, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { InputProps, Settings } from 'app/App.components/Input/newInput.type'
import {
  COLLATERAL_AWARE_BORROWING_ADJUST_YOUR_AMOUNT,
  SELECT_THE_AMOUNT_YOU_WOULD_LIKE_TO_BORROW,
} from 'texts/banners/vault.text'
import { AVALIABLE_TO_BORROW, DAO_FEE, TOTAL_AMOUNT } from 'texts/tooltips/vault.text'

type Props = {
  borrowedAsset: LoansVaultType['borrowedAsset']
  borrowCapacity: number
  borrowAPR: number
  hasUserBorrowed: boolean
  currentCollateralBalance: number
  DAOFee: number
  currentBorrowedAmount: number
  openConfirmBorrowPopup: (inputAmount: number) => void
}

export const BorrowingExpandCardBorrowSection = (props: Props) => {
  const { userTokens } = useSelector((state: State) => state.wallet.user)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const {
    borrowedAsset,
    borrowCapacity = 0,
    currentBorrowedAmount = 0,
    currentCollateralBalance = 0,
    DAOFee = 0,
    openConfirmBorrowPopup,
  } = props

  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)
  const parsedAmount = parseFloat(inputData.amount)
  const inputAmount = isNaN(parsedAmount) ? 0 : parsedAmount
  const isDisabledButton = inputData.validationStatus === INPUT_STATUS_ERROR || inputAmount === 0 || isActionActive

  const balanceSymbol = isTezosAsset(borrowedAsset?.gqlName ?? '') ? 'tezos' : borrowedAsset?.symbol.toLowerCase() ?? ''
  const userAssetBalance = userTokens[balanceSymbol]?.balance ?? 0

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = borrowedAsset
      ? calcCollateralRatio(currentCollateralBalance, currentBorrowedAmount + inputAmount, borrowedAsset.rate)
      : 0

    const futureBorrowCapacity = borrowCapacity - inputAmount * (borrowedAsset?.rate ?? 0)

    return { futureCollateralRatio, futureBorrowCapacity }
  }, [borrowedAsset, currentCollateralBalance, currentBorrowedAmount, inputAmount, borrowCapacity])

  const showWarning =
    (inputAmount > borrowCapacity / (borrowedAsset?.rate ?? 0) || futureCollateralRatio < 200) && inputAmount !== 0

  // stuff to handle inputs
  const inputOnChangeHandle = useCallback(
    (newInputAmount: string, maxAmount: number) => {
      const validationStatus = loansInputValidation({
        inputAmount: newInputAmount,
        maxAmount,
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
    [borrowedAsset?.decimals, inputData],
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
        inputOnChangeHandle(e.target.value, borrowCapacity / borrowedAsset.rate),
    }),
    [borrowCapacity, borrowedAsset.rate, inputData.amount, inputOnBlurHandle, inputOnChangeHandle, onFocusHandler],
  )

  const settings: Settings = useMemo(
    () => ({
      balance: userAssetBalance,
      balanceAsset: borrowedAsset?.symbol,
      balanceName: 'Wallet Balance',
      useMaxHandler: () =>
        inputOnChangeHandle(
          getLoansInputMaxAmount(borrowCapacity / borrowedAsset.rate, borrowedAsset.decimals),
          borrowCapacity / borrowedAsset.rate,
        ),
      inputStatus: inputData.validationStatus,
      convertedValue: inputAmount * borrowedAsset.rate,
      inputSize: INPUT_LARGE,
    }),
    [borrowCapacity, borrowedAsset, inputAmount, inputData.validationStatus, inputOnChangeHandle, userAssetBalance],
  )

  return (
    <>
      <div className="tab-text">
        Input an amount you would borrow. You are only able to borrow up to a 50% value of your collateral.
      </div>

      <div>
        <div className="tab-text">Select Amount to Borrow</div>

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

      {showWarning ? (
        <StatusMessageStyled className={`${vaultsStatuses.LIQUIDATABLE}`}>
          <Icon id="error-triangle" />
          {futureCollateralRatio < 200
            ? COLLATERAL_AWARE_BORROWING_ADJUST_YOUR_AMOUNT
            : SELECT_THE_AMOUNT_YOU_WOULD_LIKE_TO_BORROW}
        </StatusMessageStyled>
      ) : null}

      <div className={!showWarning ? 'mt-25' : ''}>
        <div className="tab-text mb-10">Updated Borrow {borrowedAsset?.symbol} Stats</div>
        <VaultOverview>
          <div className="line">
            <ThreeLevelListItem>
              <div className="name">
                Total Amount
                <CustomTooltip iconId="info" defaultStrokeColor={silverColor} text={TOTAL_AMOUNT} className="tooltip" />
              </div>
              <CommaNumber value={inputAmount} decimalsToShow={assetDecimalsToShow} className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">
                DAO Fee
                <CustomTooltip iconId="info" defaultStrokeColor={silverColor} text={DAO_FEE} className="tooltip" />
              </div>
              <CommaNumber
                value={inputAmount * (DAOFee / 100)}
                decimalsToShow={assetDecimalsToShow}
                className="value"
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Amount Received</div>
              <CommaNumber
                value={inputAmount - inputAmount * (DAOFee / 100)}
                decimalsToShow={assetDecimalsToShow}
                className="value"
              />
            </ThreeLevelListItem>

            <ThreeLevelListItem className="right">
              <div className="name">Collateral Value</div>
              <CommaNumber value={currentCollateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </div>

          <div className="line">
            <ThreeLevelListItem
              className="collateral-diagram right"
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
          onClick={() => openConfirmBorrowPopup(inputAmount)}
          disabled={isDisabledButton}
          animation={isDisabledButton ? null : BUTTON_PULSE}
        >
          <Icon id="coin-loan" />
          Borrow
        </NewButton>
      </div>
    </>
  )
}

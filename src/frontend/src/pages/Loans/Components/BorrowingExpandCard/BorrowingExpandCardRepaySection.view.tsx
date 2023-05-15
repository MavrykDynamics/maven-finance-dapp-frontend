import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { VaultOverview, StatusMessageStyled } from '../LoansComponents.style'
import {
  COLLATERAL_RATIO_GRADIENT,
  assetDecimalsToShow,
  getCollateralRationPersent,
  vaultCardTabNames,
} from 'pages/Loans/Loans.const'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import { calcCollateralRatio, getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'
import { DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue } from '../Modals/Modals.helpers'
import { State } from 'reducers'
import { repayFullAndCloseVaultAction, repayPartOfVaultAction } from 'pages/Loans/Actions/vault.actions'
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

type Props = {
  vaultId: number
  vaultAddress: string
  borrowedAsset: LoansVaultType['borrowedAsset']
  feesAmount: number
  borrowedAmount: number
  minimumRepay: number
  currentCollateralBalance: number
  borrowCapacity: number
  scrollToCurrentVault?: () => void
  activeRepayTab?: TabItem
}

export const BorrowingExpandCardRepaySection = (props: Props) => {
  const dispatch = useDispatch()
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
    scrollToCurrentVault,
    activeRepayTab,
  } = props

  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

  const inputAmount = isNaN(parseFloat(inputData.amount)) ? 0 : parseFloat(inputData.amount)
  const totalOutstanding = feesAmount + Number(borrowedAmount)
  const userAssetBalance = userTokens[borrowedAsset?.symbol ?? '']?.balance ?? 0
  const isRepayInFull = activeRepayTab?.id === vaultCardTabNames.REPAY_IN_FULL
  const isMinimumRepayWarning = inputData.validationStatus === INPUT_STATUS_ERROR && inputAmount <= minimumRepay
  const isNotRepayInFullWarning = isRepayInFull && mathRoundTwoDigit(totalOutstanding) !== inputAmount

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = borrowedAsset
      ? calcCollateralRatio(currentCollateralBalance, borrowedAmount - inputAmount, borrowedAsset.rate)
      : 0

    const futureBorrowCapacity = Math.max(borrowCapacity + inputAmount, 0)
    return { futureCollateralRatio, futureBorrowCapacity }
  }, [borrowedAsset, currentCollateralBalance, borrowCapacity, inputAmount, borrowedAmount])

  const inputOnChangeHandle = (newInputAmount: string, maxAmount: number) => {
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
  }

  const inputOnBlurHandle = () => {
    setInputData({
      ...inputData,
      amount: getOnBlurValue(inputData.amount),
    })
  }

  const onFocusHandler = () => {
    setInputData({
      ...inputData,
      amount: getOnFocusValue(inputData.amount),
    })
  }

  const handleClickRepay = async () => {
    if (vaultId && borrowedAsset && vaultAddress) {
      isRepayInFull && !isNotRepayInFullWarning
        ? await dispatch(
            repayFullAndCloseVaultAction(
              vaultId,
              vaultAddress,
              totalOutstanding,
              borrowedAsset.decimals,
              borrowedAsset.tokenType,
              borrowedAsset.address,
              () => {}, // TODO: remove
            ),
          )
        : await dispatch(
            repayPartOfVaultAction(
              vaultId,
              vaultAddress,
              inputAmount,
              borrowedAsset.decimals,
              borrowedAsset.tokenType,
              borrowedAsset.address,
              () => {}, // TODO: remove
              scrollToCurrentVault,
            ),
          )
    }
  }

  useEffect(() => {
    if (isRepayInFull) {
      const validationStatus = loansInputValidation({
        inputAmount: String(inputAmount),
        maxAmount: Math.min(userAssetBalance, totalOutstanding),
        minAmount: minimumRepay,
        options: {
          byDecimalPlaces: borrowedAsset?.decimals || assetDecimalsToShow,
        },
      })

      setInputData({
        amount: String(mathRoundTwoDigit(totalOutstanding)),
        validationStatus,
      })
    } else {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
    }
  }, [activeRepayTab, totalOutstanding])

  return (
    <>
      <div>
        <div className="tab-text">Select Amount to Repay</div>

        <Input
          className={`${borrowedAsset.rate ? 'input-with-rate' : ''} pinned-dropdown`}
          inputProps={{
            value: inputData.amount,
            type: 'number',
            onBlur: inputOnBlurHandle,
            onFocus: onFocusHandler,
            onChange: (e) => inputOnChangeHandle(e.target.value, Math.min(userAssetBalance, totalOutstanding)),
          }}
          settings={{
            balance: userAssetBalance,
            balanceAsset: borrowedAsset?.symbol,
            useMaxHandler: () =>
              inputOnChangeHandle(
                getLoansInputMaxAmount(Math.min(userAssetBalance, totalOutstanding), borrowedAsset.decimals),
                Math.min(userAssetBalance, totalOutstanding),
              ),
            inputStatus: inputData.validationStatus,
            convertedValue: inputAmount * borrowedAsset.rate,
            inputSize: INPUT_LARGE,
          }}
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
          {
            'Your outstanding debt is less than the minimum repayment amount set by the smart contracts. We will have you repay the minimum repayment amount and the amount you are overpaying will automatically be refunded by the smart contract.'
          }
        </StatusMessageStyled>
      ) : null}

      {isNotRepayInFullWarning ? (
        <StatusMessageStyled className="repay-in-full">
          <Icon id="info" />
          You are no longer fully repaying there loan.
        </StatusMessageStyled>
      ) : null}

      <div className={!isMinimumRepayWarning ? 'mt-25' : ''}>
        <div className="tab-text mb-10">Updated Repay {borrowedAsset?.symbol} Stats</div>
        <VaultOverview>
          <div className="line">
            <ThreeLevelListItem>
              <div className="name">
                Total Amount
                <CustomTooltip iconId="info" defaultStrokeColor={silverColor} text="something" className="tooltip" />
              </div>
              <CommaNumber value={inputAmount} decimalsToShow={assetDecimalsToShow} className="value" />
            </ThreeLevelListItem>

            <ThreeLevelListItem>
              <div className="name">
                Fees Due
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={colors[themeSelected].textColor}
                  text={`Your current interest fee of ${feesAmount} was rounded to ${Math.ceil(
                    feesAmount,
                  )}. Any overpaid amount will automatically be refunded.`}
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
                currentPersentage={Math.max(0, Math.min(((futureCollateralRatio - 100) / 150) * 100, 100))}
              />
            </ThreeLevelListItem>

            <ThreeLevelListItem className="right">
              <div className="name">Available To Borrow</div>
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
          disabled={userAssetBalance < inputAmount || userAssetBalance === 0 || !borrowedAmount || isActionActive}
        >
          <Icon id="okIcon" />
          Repay in {isRepayInFull ? 'Full' : 'Part'}
        </NewButton>
      </div>
    </>
  )
}

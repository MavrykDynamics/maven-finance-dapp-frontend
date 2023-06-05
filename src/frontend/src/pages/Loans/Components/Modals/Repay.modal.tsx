import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'
import { State } from 'reducers'

import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { INPUT_STATUS_SUCCESS, INPUT_STATUS_ERROR, INPUT_LARGE } from 'app/App.components/Input/Input.constants'
import { DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue, RepayPartPopupDataType } from './Modals.helpers'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { repayPartOfVaultAction } from 'pages/Loans/Actions/vault.actions'

import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { Input } from 'app/App.components/Input/NewInput'
import colors from 'styles/colors'

import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'
import {
  calcCollateralRatio,
  getLoansInputMaxAmount,
  isTezosAsset,
  loansInputValidation,
} from 'pages/Loans/Loans.helpers'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { StatusMessageStyled } from '../LoansComponents.style'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17953%3A224110&t=Sx2aEpp3ifrGxBtQ-0
export const Repay = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: RepayPartPopupDataType
}) => {
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
  } = data ?? {}

  const totalOutstanding = feesAmount + Number(borrowedAmount)

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { userTokens } = useSelector((state: State) => state.wallet.user)

  const balanceSymbol = isTezosAsset(borrowedAsset?.gqlName ?? '') ? 'tezos' : borrowedAsset?.symbol.toLowerCase() ?? ''
  const userAssetBalance = userTokens[balanceSymbol]?.balance ?? 0

  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')
  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)
  const inputAmount = isNaN(parseFloat(inputData.amount)) ? 0 : parseFloat(inputData.amount)

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = borrowedAsset
      ? calcCollateralRatio(currentCollateralBalance, borrowedAmount - inputAmount, borrowedAsset.rate)
      : 0

    const futureBorrowCapacity = Math.max(borrowCapacity + inputAmount, 0)
    return { futureCollateralRatio, futureBorrowCapacity }
  }, [borrowedAsset, currentCollateralBalance, borrowCapacity, inputAmount, borrowedAmount])

  useEffect(() => {
    if (!show) {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
      setShownScreen('initial')
    }
  }, [show])

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

  const continueBtnHandler = () => setShownScreen('confitmation')
  const backBtnHandler = () => setShownScreen('initial')

  const repayBtnHandler = async () => {
    if (vaultId && borrowedAsset && vaultAddress && scrollToCurrentVault) {
      await dispatch(
        repayPartOfVaultAction(
          vaultId,
          vaultAddress,
          inputAmount,
          borrowedAsset.decimals,
          borrowedAsset.tokenType,
          borrowedAsset.address,
          closePopup,
          scrollToCurrentVault,
        ),
      )
    }
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          {screenShown === 'initial' ? (
            <>
              <GovRightContainerTitleArea>
                <h2>Repay Borrowed {borrowedAsset?.symbol}</h2>
              </GovRightContainerTitleArea>
              <div className="modalDescr">Repay the loan to withdraw your vault collateral.</div>

              <div className="lending-stats" style={{ marginBottom: '25px' }}>
                <ThreeLevelListItem>
                  <div className="name">Borrowed</div>
                  <CommaNumber value={borrowedAmount} className="value" />
                  <CommaNumber
                    value={borrowedAmount * Number(borrowedAsset?.rate)}
                    className="rate"
                    beginningText="$"
                  />
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
                  <CommaNumber
                    value={Math.ceil(feesAmount) * Number(borrowedAsset?.rate)}
                    className="rate"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="left-divider">
                  <div className="name">Total Outstanding</div>
                  <CommaNumber value={totalOutstanding} className="value" />
                  <CommaNumber
                    value={totalOutstanding * Number(borrowedAsset?.rate)}
                    className="rate"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">Please enter how much you would like to repay</div>
              {borrowedAsset ? (
                <Input
                  className={`${borrowedAsset.rate ? 'input-with-rate' : ''} pinned-dropdown mb-45`}
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
              ) : null}

              {inputData.validationStatus === INPUT_STATUS_ERROR && inputAmount <= minimumRepay ? (
                <StatusMessageStyled className={`${vaultsStatuses.LIQUIDATABLE} borrow-message`}>
                  <Icon id="error-triangle" />
                  {
                    'Your outstanding debt is less than the minimum repayment amount set by the smart contracts. We will have you repay the minimum repayment amount and the amount you are overpaying will automatically be refunded by the smart contract.'
                  }
                </StatusMessageStyled>
              ) : null}

              <div className="manage-btn">
                <NewButton
                  kind={BUTTON_PRIMARY}
                  form={BUTTON_WIDE}
                  onClick={continueBtnHandler}
                  disabled={inputData.validationStatus !== INPUT_STATUS_SUCCESS}
                >
                  Continue
                  <Icon id="arrowRight" />
                </NewButton>
              </div>
            </>
          ) : (
            <>
              <GovRightContainerTitleArea>
                <h2>Confirm Repayment of Borrowed Funds</h2>
              </GovRightContainerTitleArea>
              <div className="modalDescr">Please confirm the following details.</div>

              <div className="lending-stats" style={{ marginBottom: '25px' }}>
                <ThreeLevelListItem>
                  <div className="name">Asset</div>
                  <div className="value">{borrowedAsset?.symbol}</div>
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Amount</div>
                  <CommaNumber value={inputAmount} decimalsToShow={assetDecimalsToShow} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="right">
                  <div className="name">USD Value</div>
                  <CommaNumber value={inputAmount * Number(borrowedAsset?.rate)} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">New Vaults Stats</div>
              <VaultModalOverview>
                <ThreeLevelListItem
                  className="collateral-diagram"
                  customColor={getCollateralRationPersent(futureCollateralRatio)}
                >
                  <div className={`percentage`}>
                    Collateral Ratio:{' '}
                    <CommaNumber value={futureCollateralRatio} endingText="%" showDecimal decimalsToShow={2} />
                  </div>
                  <GradientDiagram
                    className="diagram"
                    colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                    currentPersentage={Math.max(0, Math.min(((futureCollateralRatio - 100) / 150) * 100, 100))}
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Collateral Value</div>
                  <CommaNumber value={currentCollateralBalance} className="value" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Available To Borrow</div>
                  <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </VaultModalOverview>

              <div className="buttons-wrapper" style={{ marginTop: '40px' }}>
                <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={backBtnHandler}>
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={repayBtnHandler}>
                  <Icon id="okIcon" />
                  Repay
                </NewButton>
              </div>
            </>
          )}
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

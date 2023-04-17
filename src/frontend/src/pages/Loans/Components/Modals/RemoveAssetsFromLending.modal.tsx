import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'

import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { INPUT_LARGE, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { silverColor } from 'styles'
import {
  DEFAULT_LOANS_INPUT_VALUE,
  getOnBlurValue,
  getOnFocusValue,
  RemoveLendingAssetDataType,
  loansInputValidation,
} from './Modals.helpers'
import { State } from 'reducers'

import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase } from './Modals.style'
import { withdrawLendingAssetAction } from 'pages/Loans/Actions/lendingAsset.actions'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import colors from 'styles/colors'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A238846&t=Sx2aEpp3ifrGxBtQ-0
export const RemoveAssetsFromLending = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data?: RemoveLendingAssetDataType
}) => {
  const {
    userBalance = 0,
    mBalance = 0,
    rate = 0,
    symbol = '',
    currentLendedAmount = 0,
    decimals = 0,
    lendingAPY = 0,
    icon = '',
    gqlName = '',
  } = data ?? {}

  useLockBodyScroll(show)

  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')
  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

  const continueBtnDisabled = useMemo(
    () => inputData.validationStatus !== INPUT_STATUS_SUCCESS,
    [inputData.validationStatus],
  )

  const continueBtnHandler = () => setShownScreen('confitmation')
  const backBtnHandler = () => setShownScreen('initial')

  const onChangeHandler = (inputAmount: string, maxAmount: number, symbol?: string) => {
    const validationStatus = loansInputValidation({ inputAmount, maxAmount, symbol })

    setInputData({
      ...inputData,
      amount: inputAmount,
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

  useEffect(() => {
    if (!show) {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
      setShownScreen('initial')
    }
  }, [show])

  const isWithdrawDisabled = useMemo(() => {
    return inputData.validationStatus !== INPUT_STATUS_SUCCESS || isActionLoading
  }, [inputData.validationStatus, isActionLoading])

  const withdrawHandler = () =>
    dispatch(withdrawLendingAssetAction(gqlName, Number(inputData.amount), decimals, closePopup))

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Withdraw Assets</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">
            Select the amount you wish to withdraw from lending. You cannot withdraw more than you have deposited.
          </div>

          {screenShown === 'initial' ? (
            <>
              <div className="lending-stats" style={{ marginBottom: '25px' }}>
                <ThreeLevelListItem>
                  <div className="name">m{symbol} Balance</div>
                  <CommaNumber value={mBalance} className="value" endingText={`m${symbol}`} />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">
                    Lending APY{' '}
                    <CustomTooltip
                      iconId="info"
                      defaultStrokeColor={colors[themeSelected].textColor}
                      text={'Current yield suppliers are earning on their deposits.'}
                      className="tooltip"
                    />
                  </div>
                  <CommaNumber value={lendingAPY} className="value" endingText="%" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Wallet Balance</div>
                  <CommaNumber value={userBalance * rate} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">Select amount to remove</div>
              <Input
                className={`${rate ? 'input-with-rate' : ''} pinned-dropdown mb-45`}
                inputProps={{
                  value: inputData.amount,
                  type: 'number',
                  onBlur: inputOnBlurHandle,
                  onFocus: onFocusHandler,
                  onChange: (e) => onChangeHandler(e.target.value, Math.min(mBalance, currentLendedAmount), symbol),
                }}
                settings={{
                  balance: userBalance,
                  balanceAsset: symbol,
                  useMaxHandler: () =>
                    onChangeHandler(
                      String(Math.min(mBalance, currentLendedAmount)),
                      Math.min(mBalance, currentLendedAmount),
                      symbol,
                    ),
                  inputStatus: inputData.validationStatus,
                  convertedValue: Number(inputData.amount) * rate,
                  inputSize: INPUT_LARGE,
                }}
              >
                <InputPinnedTokenInfo>
                  <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> {symbol}
                </InputPinnedTokenInfo>
              </Input>

              <div className="manage-btn">
                <NewButton
                  kind={BUTTON_PRIMARY}
                  form={BUTTON_WIDE}
                  onClick={continueBtnHandler}
                  disabled={continueBtnDisabled}
                >
                  Continue
                  <Icon id="arrowRight" />
                </NewButton>
              </div>
            </>
          ) : (
            <>
              <div className="loans-confirmation-info">
                <div className="lending-stats">
                  <ThreeLevelListItem>
                    <div className="name">Amount Removed</div>
                    <CommaNumber value={Number(inputData.amount)} className="value" endingText={symbol} />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem className="right">
                    <div className="name">USD Value</div>
                    <CommaNumber value={Number(inputData.amount) * rate} className="value" beginningText="$" />
                  </ThreeLevelListItem>
                </div>
                <hr />
                <div className="lending-stats">
                  <ThreeLevelListItem>
                    <div className="name">New Lending Amount</div>
                    <CommaNumber
                      value={currentLendedAmount - Number(inputData.amount)}
                      className="value"
                      endingText={symbol}
                    />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem className="right">
                    <div className="name">New USD Value</div>
                    <CommaNumber
                      value={(currentLendedAmount - Number(inputData.amount)) * rate}
                      className="value"
                      beginningText="$"
                    />
                  </ThreeLevelListItem>
                </div>
              </div>

              <div className="buttons-wrapper">
                <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={backBtnHandler}>
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton
                  kind={BUTTON_PRIMARY}
                  form={BUTTON_WIDE}
                  onClick={withdrawHandler}
                  disabled={isWithdrawDisabled}
                >
                  <Icon id="minus" />
                  Remove Asset
                </NewButton>
              </div>
            </>
          )}
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

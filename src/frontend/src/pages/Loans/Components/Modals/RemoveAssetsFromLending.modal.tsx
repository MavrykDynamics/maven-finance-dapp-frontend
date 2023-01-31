import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'

import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { silverColor } from 'styles'
import { getAssetName } from 'pages/Loans/Loans.helpers'
import { withdrawLendingAssetAction } from 'pages/Loans/Loans.actions'
import {
  DEFAULT_LOANS_INPUT_VALUE,
  getOnBlurValue,
  getOnFocusValue,
  RemoveLendingAssetDataType,
} from './Modals.helpers'
import { State } from 'reducers'

import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase } from './Modals.style'

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
    assetRate = 0,
    assetName = '',
    currentLendedAmount = 0,
    lendingAPY = 0,
    assetIcon = '',
    originalName = '',
  } = data ?? {}
  const assetSymbol = assetName ?? originalName.toUpperCase()

  useLockBodyScroll(show)

  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')
  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

  const continueBtnDisabled = useMemo(
    () => inputData.validationStatus !== INPUT_STATUS_SUCCESS,
    [inputData.validationStatus],
  )

  const continueBtnHandler = () => setShownScreen('confitmation')
  const backBtnHandler = () => setShownScreen('initial')

  const onChangeHandler = (inputAmount: string, maxAmount: number) => {
    const validationStatus =
      Number(inputAmount) > 0 && Number(inputAmount) <= maxAmount ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR

    if (validationStatus === INPUT_STATUS_ERROR && inputAmount !== '' && inputAmount !== '0') return

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
  }, [inputData.validationStatus])

  const withdrawHandler = () => dispatch(withdrawLendingAssetAction(originalName, Number(inputData.amount), closePopup))

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
                  <div className="name">m{assetSymbol} Balance</div>
                  <CommaNumber value={mBalance} className="value" endingText={`m${assetSymbol}`} />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">
                    Lending APY{' '}
                    <CustomTooltip iconId="info" defaultStrokeColor={silverColor} text="" className="tooltip" />
                  </div>
                  <CommaNumber value={lendingAPY} className="value" endingText="%" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Wallet Balance</div>
                  <CommaNumber value={userBalance * assetRate} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">Select amount to remove</div>
              <Input
                className={`${assetRate ? 'input-with-rate' : ''} large-input pinned-dropdown withdrawCollateralInput`}
                inputProps={{
                  value: inputData.amount,
                  type: 'number',
                  onBlur: inputOnBlurHandle,
                  onFocus: onFocusHandler,
                  onChange: (e) => onChangeHandler(e.target.value, Math.min(mBalance, currentLendedAmount)),
                }}
                settings={{
                  balance: userBalance,
                  balanceAsset: assetSymbol,
                  useMaxHandler: () =>
                    onChangeHandler(
                      String(Math.min(mBalance, currentLendedAmount)),
                      Math.min(mBalance, currentLendedAmount),
                    ),
                  inputStatus: inputData.validationStatus,
                  convertedValue: Number(inputData.amount) * assetRate,
                }}
              >
                <InputPinnedTokenInfo>
                  {assetIcon ? (
                    <div className="image-wrapper">
                      <img src={assetIcon} alt={`${assetSymbol}-logo`} />
                    </div>
                  ) : (
                    <Icon id="noImage" />
                  )}{' '}
                  {assetSymbol}
                </InputPinnedTokenInfo>
              </Input>

              <NewButton
                kind={ACTION_PRIMARY}
                onClick={continueBtnHandler}
                disabled={continueBtnDisabled}
                className="modal-manage-btn"
              >
                Continue
                <Icon id="arrowRight" />
              </NewButton>
            </>
          ) : (
            <>
              <div className="loans-confirmation-info">
                <div className="lending-stats">
                  <ThreeLevelListItem>
                    <div className="name">Amount Removed</div>
                    <CommaNumber value={Number(inputData.amount)} className="value" endingText={assetSymbol} />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem className="right">
                    <div className="name">USD Value</div>
                    <CommaNumber value={Number(inputData.amount) * assetRate} className="value" beginningText="$" />
                  </ThreeLevelListItem>
                </div>
                <hr />
                <div className="lending-stats">
                  <ThreeLevelListItem>
                    <div className="name">New Lending Amount</div>
                    <CommaNumber
                      value={currentLendedAmount - Number(inputData.amount)}
                      className="value"
                      endingText={assetSymbol}
                    />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem className="right">
                    <div className="name">New USD Value</div>
                    <CommaNumber
                      value={(currentLendedAmount - Number(inputData.amount)) * assetRate}
                      className="value"
                      beginningText="$"
                    />
                  </ThreeLevelListItem>
                </div>
              </div>

              <div className="buttons-wrapper">
                <NewButton kind={TRANSPARENT_WITH_BORDER} onClick={backBtnHandler} className="modal-manage-btn">
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton
                  kind={ACTION_PRIMARY}
                  onClick={withdrawHandler}
                  disabled={isWithdrawDisabled}
                  className="modal-manage-btn"
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

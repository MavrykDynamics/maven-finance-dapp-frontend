import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLockBodyScroll } from 'react-use'

import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { silverColor } from 'styles'
import { getAssetName } from 'pages/Loans/Loans.helpers'
import { AddLendingAssetDataType } from './AddLendingAsset.modal'

import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase } from './Modals.style'
import { withdrawLendingAssetAction } from 'pages/Loans/Loans.actions'

export type RemoveLendingAssetDataType = AddLendingAssetDataType & {
  currentLendedAmount: number
}

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
  const dispatch = useDispatch()
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')
  const [inputAmount, setInputAmount] = useState('0')
  const [inputValidationStatus, setInputValidationStatus] = useState<InputStatusType>('')

  const continueBtnHandler = () => {
    setShownScreen('confitmation')
  }

  const backBtnHandler = () => {
    setShownScreen('initial')
  }

  const {
    userBalance = 0,
    mBalance = 0,
    assetRate = 1,
    assetName = '',
    currentLendedAmount = 0,
    lendingAPY = 0,
    assetIcon = '',
  } = data ?? {}

  useLockBodyScroll(show)

  const onChangeHandler = (inputAmount: string, userBalance: number) => {
    const validationStatus =
      Number(inputAmount) > 0 && Number(inputAmount) <= userBalance && Number(inputAmount) <= currentLendedAmount
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR

    if (validationStatus === INPUT_STATUS_ERROR && inputAmount !== '' && inputAmount !== '0') return

    setInputAmount(inputAmount)
    setInputValidationStatus(validationStatus)
  }

  const onBlurHandler = (inputAmount: string) => {
    setInputAmount(inputAmount === '' ? '0' : inputAmount)
  }

  const onFocusHandler = (inputAmount: string) => {
    setInputAmount(inputAmount === '0' ? '' : inputAmount)
  }

  useEffect(() => {
    if (!show) {
      setInputValidationStatus('')
      setInputAmount('0')
    }
  }, [show])

  const isWithdrawDisabled = useMemo(() => {
    return inputValidationStatus !== INPUT_STATUS_SUCCESS
  }, [inputValidationStatus])

  const withdrawHandler = () => dispatch(withdrawLendingAssetAction(assetName, Number(inputAmount), closePopup))

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
                  <div className="name">m{getAssetName(assetName)} Balance</div>
                  <CommaNumber value={mBalance} className="value" endingText={`m${getAssetName(assetName)}`} />
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
                  value: inputAmount,
                  type: 'number',
                  onBlur: (e) => onBlurHandler(e.target.value),
                  onFocus: (e) => onFocusHandler(e.target.value),
                  onChange: (e) => onChangeHandler(e.target.value, userBalance),
                }}
                settings={{
                  balance: userBalance,
                  balanceAsset: assetName,
                  useMaxHandler: () => onChangeHandler(String(userBalance), userBalance),
                  inputStatus: inputValidationStatus,
                  convertedValue: Number(inputAmount) * assetRate,
                }}
              >
                <InputPinnedTokenInfo>
                  {assetIcon ? (
                    <div className="image-wrapper">
                      <img src={assetIcon} alt={`${assetName}-logo`} />
                    </div>
                  ) : (
                    <Icon id="noImage" />
                  )}{' '}
                  {getAssetName(assetName)}
                </InputPinnedTokenInfo>
              </Input>

              <NewButton kind={ACTION_PRIMARY} onClick={continueBtnHandler} className="modal-manage-btn">
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
                    <CommaNumber value={Number(inputAmount)} className="value" endingText={getAssetName(assetName)} />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem className="right">
                    <div className="name">USD Value</div>
                    <CommaNumber value={Number(inputAmount) * assetRate} className="value" beginningText="$" />
                  </ThreeLevelListItem>
                </div>
                <hr />
                <div className="lending-stats">
                  <ThreeLevelListItem>
                    <div className="name">New Lending Amount</div>
                    <CommaNumber
                      value={currentLendedAmount - Number(inputAmount)}
                      className="value"
                      endingText={getAssetName(assetName)}
                    />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem className="right">
                    <div className="name">New USD Value</div>
                    <CommaNumber
                      value={(currentLendedAmount - Number(inputAmount)) * assetRate}
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

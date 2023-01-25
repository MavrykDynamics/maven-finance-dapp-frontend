import { useDispatch } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'

import { getAssetName } from 'pages/Loans/Loans.helpers'
import { COLLATERAL_RATIO_GRADIENT } from 'pages/Loans/Loans.const'
import { InputStatusType, INPUT_STATUS_SUCCESS, INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'
import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { Input } from 'app/App.components/Input/NewInput'

import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { repayPartOfVaultAction } from 'pages/Loans/Loans.actions'

export type RepayPartPopupDataType = {
  vaultAddress: string
  borrowedAsset: BorrowingData['borrowedAsset']
  borrowedAmount: number
  feesAmount: number
  totalOutstanding: number
  currentCollateralBalance: number
  currentAvaliableToBorrow: number
} | null

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
    vaultAddress,
    borrowedAsset,
    feesAmount = 0,
    totalOutstanding = 0,
    borrowedAmount = 0,
    currentCollateralBalance = 0,
    currentAvaliableToBorrow = 0,
  } = data ?? {}

  const dispatch = useDispatch()
  useLockBodyScroll(show)
  const assetName = getAssetName(borrowedAsset?.assetName ?? '')

  const [inputData, setInputData] = useState<{ amount: string; validationStatus: InputStatusType }>({
    amount: '0',
    validationStatus: '',
  })
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')

  const continueBtnHandler = () => {
    setShownScreen('confitmation')
  }

  const backBtnHandler = () => {
    setShownScreen('initial')
  }

  const [isActionPerforming, setIsActionPerforming] = useState(false)

  const isActionBtnDisabled = useMemo(() => isActionPerforming, [isActionPerforming])

  useEffect(() => {
    if (!show) {
      setInputData({
        amount: '0',
        validationStatus: '',
      })
      setIsActionPerforming(false)
      setShownScreen('initial')
    }
  }, [show])

  // stuff to handle inputs
  const inputOnChangeHandle = (newInputAmount: string, userAssetBalance: number) => {
    const validationStatus =
      Number(newInputAmount) > 0 && Number(newInputAmount) <= userAssetBalance
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR

    if (validationStatus === INPUT_STATUS_ERROR && newInputAmount !== '' && newInputAmount !== '0') return

    if (inputData) {
      setInputData({
        ...inputData,
        amount: newInputAmount,
        validationStatus: validationStatus,
      })
    }
  }

  const inputOnBlurHandle = () => {
    if (inputData) {
      setInputData({
        ...inputData,
        amount: inputData.amount === '' ? '0' : inputData.amount,
      })
    }
  }

  const onFocusHandler = () => {
    if (inputData) {
      setInputData({
        ...inputData,
        amount: inputData.amount === '0' ? '' : inputData.amount,
      })
    }
  }

  const repayBtnHandler = async () => {
    if (vaultAddress) {
      setIsActionPerforming(true)
      await dispatch(repayPartOfVaultAction(vaultAddress, Number(inputData.amount), closePopup))
      setIsActionPerforming(false)
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
                <h2>Repay Borrowed Funds</h2>
              </GovRightContainerTitleArea>
              <div className="modalDescr">Repay the loan to withdraw your vault collateral.</div>

              <div className="lending-stats" style={{ marginBottom: '25px' }}>
                <ThreeLevelListItem>
                  <div className="name">Borrowed</div>
                  <CommaNumber value={borrowedAmount} className="value" endingText={assetName} />
                  <CommaNumber
                    value={borrowedAmount * Number(borrowedAsset?.assetRate)}
                    className="rate"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Fees Due</div>
                  <CommaNumber value={feesAmount} className="value" endingText={assetName} />
                  <CommaNumber
                    value={feesAmount * Number(borrowedAsset?.assetRate)}
                    className="rate"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="left-divider">
                  <div className="name">Total Outstanding</div>
                  <CommaNumber value={totalOutstanding} className="value" endingText={assetName} />
                  <CommaNumber
                    value={totalOutstanding * Number(borrowedAsset?.assetRate)}
                    className="rate"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">Please enter how much you would like to repay</div>
              {borrowedAsset ? (
                <Input
                  className={`${
                    borrowedAsset.assetRate ? 'input-with-rate' : ''
                  } large-input pinned-dropdown withdrawCollateralInput`}
                  inputProps={{
                    value: inputData.amount,
                    type: 'number',
                    onBlur: inputOnBlurHandle,
                    onFocus: onFocusHandler,
                    onChange: (e) => inputOnChangeHandle(e.target.value, borrowedAsset.userBalance),
                  }}
                  settings={{
                    balance: borrowedAsset.userBalance,
                    balanceAsset: assetName,
                    useMaxHandler: () =>
                      inputOnChangeHandle(String(borrowedAsset.userBalance), borrowedAsset.userBalance),
                    inputStatus: inputData.validationStatus,
                    convertedValue: Number(inputData.amount) * borrowedAsset.assetRate,
                  }}
                >
                  <InputPinnedTokenInfo>
                    {borrowedAsset.assetIcon ? (
                      <div className="image-wrapper">
                        <img src={borrowedAsset.assetIcon} alt={borrowedAsset.assetName + '-logo'} />
                      </div>
                    ) : (
                      <Icon id="noImage" />
                    )}{' '}
                    {assetName}
                  </InputPinnedTokenInfo>
                </Input>
              ) : null}

              <NewButton
                kind={ACTION_PRIMARY}
                onClick={continueBtnHandler}
                disabled={inputData.validationStatus !== INPUT_STATUS_SUCCESS}
                className="modal-manage-btn"
              >
                Continue
                <Icon id="arrowRight" />
              </NewButton>
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
                  <div className="value">{assetName}</div>
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Amount</div>
                  <CommaNumber value={Number(inputData.amount)} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="right">
                  <div className="name">USD Value</div>
                  <CommaNumber
                    value={Number(inputData.amount) * Number(borrowedAsset?.assetRate)}
                    className="value"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">New Vaults Stats</div>
              <VaultModalOverview>
                <ThreeLevelListItem className="collateral-diagram">
                  <div className={`percentage ${Number(154) / 100 > 2.5 ? 'up' : 'down'}`}>
                    Collateral Ratio: <CommaNumber value={154} endingText="%" />
                  </div>
                  <GradientDiagram
                    className="diagram"
                    colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                    currentPersentage={50}
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Collateral Value</div>
                  <CommaNumber value={currentCollateralBalance} className="value" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Available To Borrow</div>
                  <CommaNumber value={currentAvaliableToBorrow} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </VaultModalOverview>

              <div className="buttons-wrapper" style={{ marginTop: '40px' }}>
                <NewButton kind={TRANSPARENT_WITH_BORDER} onClick={backBtnHandler} className="modal-manage-btn">
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton
                  kind={ACTION_PRIMARY}
                  onClick={repayBtnHandler}
                  disabled={isActionBtnDisabled}
                  className="modal-manage-btn"
                >
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

import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useState } from 'react'

import { COLLATERAL_RATIO_GRADIENT } from 'pages/Loans/Loans.const'
import { INPUT_STATUS_SUCCESS, INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
import { DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue, RepayPartPopupDataType } from './Modals.helpers'
import { State } from 'reducers'
import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { repayPartOfVaultAction } from 'pages/Loans/Actions/vault.actions'
import { getAssetDisplayName } from 'pages/Loans/Loans.helpers'

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
    currentCollateralBalance = 0,
    currentAvaliableToBorrow = 0,
    borrowedAmount,
  } = data ?? {}

  const totalOutstanding = feesAmount + Number(borrowedAmount)

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)

  const assetToDisplayName = getAssetDisplayName(borrowedAsset?.gqlName)

  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')
  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

  useEffect(() => {
    if (!show) {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
      setShownScreen('initial')
    }
  }, [show])

  const inputOnChangeHandle = (newInputAmount: string, maxAmount: number) => {
    const validationStatus =
      Number(newInputAmount) > 0 && Number(newInputAmount) <= maxAmount ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR

    if (validationStatus === INPUT_STATUS_ERROR && newInputAmount !== '' && newInputAmount !== '0') return

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
    if (vaultAddress) {
      await dispatch(repayPartOfVaultAction(vaultAddress, Number(inputData.amount), closePopup))
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
                  <CommaNumber value={Number(borrowedAmount)} className="value" endingText={assetToDisplayName} />
                  <CommaNumber
                    value={Number(borrowedAmount) * Number(borrowedAsset?.rate)}
                    className="rate"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Fees Due</div>
                  <CommaNumber value={feesAmount} className="value" endingText={assetToDisplayName} />
                  <CommaNumber value={feesAmount * Number(borrowedAsset?.rate)} className="rate" beginningText="$" />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="left-divider">
                  <div className="name">Total Outstanding</div>
                  <CommaNumber value={totalOutstanding} className="value" endingText={assetToDisplayName} />
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
                  className={`${
                    borrowedAsset.rate ? 'input-with-rate' : ''
                  } large-input pinned-dropdown withdrawCollateralInput`}
                  inputProps={{
                    value: inputData.amount,
                    type: 'number',
                    onBlur: inputOnBlurHandle,
                    onFocus: onFocusHandler,
                    onChange: (e) =>
                      inputOnChangeHandle(e.target.value, Math.min(borrowedAsset.userBalance, totalOutstanding)),
                  }}
                  settings={{
                    balance: borrowedAsset.userBalance,
                    balanceAsset: assetToDisplayName,
                    useMaxHandler: () =>
                      inputOnChangeHandle(
                        String(Math.min(borrowedAsset.userBalance, totalOutstanding)),
                        Math.min(borrowedAsset.userBalance, totalOutstanding),
                      ),
                    inputStatus: inputData.validationStatus,
                    convertedValue: Number(inputData.amount) * borrowedAsset.rate,
                  }}
                >
                  <InputPinnedTokenInfo>
                    {borrowedAsset.icon ? (
                      <div className="image-wrapper">
                        <img src={borrowedAsset.icon} alt={assetToDisplayName + '-logo'} />
                      </div>
                    ) : (
                      <Icon id="noImage" />
                    )}{' '}
                    {assetToDisplayName}
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
                  <div className="value">{assetToDisplayName}</div>
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Amount</div>
                  <CommaNumber value={Number(inputData.amount)} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem className="right">
                  <div className="name">USD Value</div>
                  <CommaNumber
                    value={Number(inputData.amount) * Number(borrowedAsset?.rate)}
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
                  disabled={isActionLoading}
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

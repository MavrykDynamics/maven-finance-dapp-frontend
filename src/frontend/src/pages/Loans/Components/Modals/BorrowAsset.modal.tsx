import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useState } from 'react'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { COLLATERAL_RATIO_GRADIENT } from 'pages/Loans/Loans.const'
import { BorrowPopupDataType, DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue } from './Modals.helpers'
import { State } from 'reducers'
import { ACTION_PRIMARY, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import Icon from 'app/App.components/Icon/Icon.view'

import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { silverColor } from 'styles'
import { borrowVaultAssetAction } from 'pages/Loans/Actions/vault.actions'
import { getAssetDisplayName } from 'pages/Loans/Loans.helpers'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A240058&t=Sx2aEpp3ifrGxBtQ-0
export const BorrowAsset = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: BorrowPopupDataType
}) => {
  const {
    vaultId,
    borrowedAsset,
    borowCapacity = 0,
    collateralRatio = 0,
    borrowAPR = 0,
    hasUserBorrowed,
    currentCollateralBalance = 0,
    currentAvaliableToBorrow = 0,
  } = data ?? {}

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)

  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')

  const assetNameToDisplay = getAssetDisplayName(borrowedAsset?.gqlName)

  useEffect(() => {
    if (!show) {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
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

  const borrowAsserHandler = async () => {
    if (vaultId && borrowedAsset) {
      await dispatch(
        borrowVaultAssetAction(vaultId, Number(inputData.amount) * 10 ** borrowedAsset.decimals, closePopup),
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
                {hasUserBorrowed ? (
                  <h2>Borrow Additional {assetNameToDisplay}</h2>
                ) : (
                  <h2>Borrow {assetNameToDisplay}</h2>
                )}
              </GovRightContainerTitleArea>
              <div className="modalDescr">
                Select the asset you would like to borrow. You cannot borrow more than your borrow capacity.
              </div>

              <div className="lending-stats" style={{ marginBottom: '30px' }}>
                <ThreeLevelListItem>
                  <div className="name">Borrow Capacity</div>
                  <CommaNumber value={borowCapacity} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Collateral Utilization</div>
                  <CommaNumber value={collateralRatio} className="value" endingText="%" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Borrow APR</div>
                  <CommaNumber value={borrowAPR} className="value" endingText="%" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">
                    DAO Fee{' '}
                    <CustomTooltip iconId="info" defaultStrokeColor={silverColor} text={``} className="tooltip" />
                  </div>
                  <CommaNumber value={1} className="value" endingText="%" />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">Select asset and amount to borrow</div>
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
                    onChange: (e) => inputOnChangeHandle(e.target.value, borrowedAsset.userBalance),
                  }}
                  settings={{
                    balance: borrowedAsset.userBalance,
                    balanceAsset: assetNameToDisplay,
                    useMaxHandler: () =>
                      inputOnChangeHandle(String(borrowedAsset.userBalance), borrowedAsset.userBalance),
                    inputStatus: inputData.validationStatus,
                    convertedValue: Number(inputData.amount) * borrowedAsset.rate,
                  }}
                >
                  <InputPinnedTokenInfo>
                    {borrowedAsset.icon ? (
                      <div className="image-wrapper">
                        <img src={borrowedAsset.icon} alt={borrowedAsset.name + '-logo'} />
                      </div>
                    ) : (
                      <Icon id="noImage" />
                    )}{' '}
                    {assetNameToDisplay}
                  </InputPinnedTokenInfo>
                </Input>
              ) : null}

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
                <h2>Confirm Borrow {assetNameToDisplay}</h2>
              </GovRightContainerTitleArea>
              <div className="modalDescr">
                Select the asset you would like to borrow. You cannot borrow more than your borrow capacity.
              </div>

              <div className="lending-stats" style={{ marginBottom: '30px' }}>
                <ThreeLevelListItem>
                  <div className="name">Asset</div>
                  <div className="value">{assetNameToDisplay}</div>
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">
                    Total Amount{' '}
                    <CustomTooltip iconId="info" defaultStrokeColor={silverColor} text={``} className="tooltip" />
                  </div>
                  <CommaNumber value={Number(inputData.amount)} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Amount Received</div>
                  <CommaNumber value={Number(inputData.amount)} className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">USD Value</div>
                  <CommaNumber
                    value={Number(inputData.amount) * Number(borrowedAsset?.rate)}
                    className="value"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">New Vault Stats</div>
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
                  <div className="name">Available To Withdraw</div>
                  <CommaNumber value={currentAvaliableToBorrow} className="value" beginningText="$" />
                </ThreeLevelListItem>
              </VaultModalOverview>

              <div className="buttons-wrapper">
                <NewButton kind={TRANSPARENT_WITH_BORDER} onClick={backBtnHandler} className="modal-manage-btn">
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton
                  kind={ACTION_PRIMARY}
                  onClick={borrowAsserHandler}
                  disabled={isActionLoading}
                  className="modal-manage-btn"
                >
                  <Icon id="coin-loan" />
                  Borrow XTZ
                </NewButton>
              </div>
            </>
          )}
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

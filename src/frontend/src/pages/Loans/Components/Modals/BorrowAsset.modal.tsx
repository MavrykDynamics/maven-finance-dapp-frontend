import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'

import { INPUT_LARGE, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { BorrowPopupDataType, DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue } from './Modals.helpers'
import { State } from 'reducers'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton'
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
import { calcCollateralRatio } from 'pages/Loans/Loans.helpers'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { StatusMessageStyled } from '../LoansComponents.style'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import colors from 'styles/colors'

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
    borrowCapacity = 0,
    collateralRatio = 0,
    borrowAPR = 0,
    hasUserBorrowed,
    currentBorrowedAmount = 0,
    currentCollateralBalance = 0,
    DAOFee = 0,
    scrollToCurrentVault,
  } = data ?? {}

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)
  const [screenShown, setShownScreen] = useState<'initial' | 'confitmation'>('initial')

  const inputAmount = isNaN(parseFloat(inputData.amount)) ? 0 : parseFloat(inputData.amount)

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = borrowedAsset
      ? calcCollateralRatio(currentCollateralBalance, currentBorrowedAmount + inputAmount, borrowedAsset.rate)
      : 0

    const futureBorrowCapacity = borrowCapacity - inputAmount * (borrowedAsset?.rate ?? 0)

    return { futureCollateralRatio, futureBorrowCapacity }
  }, [borrowedAsset, currentCollateralBalance, currentBorrowedAmount, inputAmount, borrowCapacity])

  useEffect(() => {
    if (!show) {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
      setShownScreen('initial')
    }
  }, [show])

  // stuff to handle inputs
  const inputOnChangeHandle = (newInputAmount: string, maxAmount: number) => {
    const validationStatus =
      Number(newInputAmount) > 0 && Number(newInputAmount) <= maxAmount ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR

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
    if (vaultId && borrowedAsset && scrollToCurrentVault) {
      await dispatch(
        borrowVaultAssetAction(
          vaultId,
          Number(inputData.amount),
          borrowedAsset.decimals,
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
                {hasUserBorrowed ? (
                  <h2>Borrow Additional {borrowedAsset?.symbol}</h2>
                ) : (
                  <h2>Borrow {borrowedAsset?.symbol}</h2>
                )}
              </GovRightContainerTitleArea>
              <div className="modalDescr">
                Select the asset you would like to borrow. You cannot borrow more than your borrow capacity.
              </div>

              <div className="lending-stats" style={{ marginBottom: '30px' }}>
                <ThreeLevelListItem>
                  <div className="name">Borrow Capacity</div>
                  <CommaNumber value={borrowCapacity} className="value" beginningText="$" />
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
                    <CustomTooltip
                      iconId="info"
                      defaultStrokeColor={colors[themeSelected].textColor}
                      text={`Origination fee`}
                      className="tooltip"
                    />
                  </div>
                  <CommaNumber value={DAOFee} className="value" endingText="%" />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">Select the amount to borrow</div>
              {borrowedAsset ? (
                <Input
                  className={`${borrowedAsset.rate ? 'input-with-rate' : ''} pinned-dropdown mb-45`}
                  inputProps={{
                    value: inputData.amount,
                    type: 'number',
                    onBlur: inputOnBlurHandle,
                    onFocus: onFocusHandler,
                    onChange: (e) => inputOnChangeHandle(e.target.value, borrowCapacity / borrowedAsset.rate),
                  }}
                  settings={{
                    balance: borrowedAsset.userBalance,
                    balanceAsset: borrowedAsset?.symbol,
                    useMaxHandler: () =>
                      inputOnChangeHandle(
                        String(borrowCapacity / borrowedAsset.rate),
                        borrowCapacity / borrowedAsset.rate,
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

              <div className="block-name">New Vault Stats</div>
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

              {inputAmount > borrowCapacity / (borrowedAsset?.rate ?? 0) || futureCollateralRatio < 200 ? (
                <StatusMessageStyled className={`${vaultsStatuses.LIQUIDATABLE} borrow-message`}>
                  <Icon id="error-triangle" />
                  {futureCollateralRatio < 200
                    ? 'The amount you wish to borrow would under-collateralize your vault. Please enter a different amount to borrow so your vault will not be under-collateralized when you borrow.'
                    : 'Select the amount you would like to borrow. You cannot borrow more than your borrow capacity.'}
                </StatusMessageStyled>
              ) : null}

              <div className="manage-btn">
                <NewButton
                  kind={BUTTON_PRIMARY}
                  onClick={continueBtnHandler}
                  form={BUTTON_WIDE}
                  disabled={inputData.validationStatus !== INPUT_STATUS_SUCCESS || futureCollateralRatio < 200}
                >
                  Continue
                  <Icon id="arrowRight" />
                </NewButton>
              </div>
            </>
          ) : (
            <>
              <GovRightContainerTitleArea>
                <h2>Confirm Borrow {borrowedAsset?.symbol}</h2>
              </GovRightContainerTitleArea>
              <div className="modalDescr">
                Select the asset you would like to borrow. You cannot borrow more than your borrow capacity.
              </div>

              <div className="lending-stats" style={{ marginBottom: '30px' }}>
                <ThreeLevelListItem>
                  <div className="name">Total Amount</div>
                  <CommaNumber value={inputAmount} className="value" endingText={borrowedAsset?.symbol} />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">
                    Amount Received{' '}
                    <CustomTooltip
                      iconId="info"
                      defaultStrokeColor={silverColor}
                      text={`Total Amount minus DAO Fee`}
                      className="tooltip"
                    />
                  </div>
                  <CommaNumber
                    value={inputAmount - inputAmount * (DAOFee / 100)}
                    className="value"
                    endingText={borrowedAsset?.symbol}
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">DAO Fee</div>
                  <CommaNumber
                    value={inputAmount * (DAOFee / 100)}
                    className="value"
                    endingText={borrowedAsset?.symbol}
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">USD Value</div>
                  <CommaNumber
                    value={(inputAmount - inputAmount * (DAOFee / 100)) * Number(borrowedAsset?.rate)}
                    className="value"
                    beginningText="$"
                  />
                </ThreeLevelListItem>
              </div>

              <div className="block-name">New Vault Stats</div>
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

              <div className="buttons-wrapper">
                <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={backBtnHandler}>
                  <Icon id="arrowLeft" />
                  Back
                </NewButton>
                <NewButton
                  kind={BUTTON_PRIMARY}
                  form={BUTTON_WIDE}
                  onClick={borrowAsserHandler}
                  disabled={isActionLoading}
                >
                  <Icon id="coin-loan" />
                  Borrow {borrowedAsset?.symbol}
                </NewButton>
              </div>
            </>
          )}
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

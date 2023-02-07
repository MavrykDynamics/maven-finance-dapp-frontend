import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { State } from 'reducers'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import {
  DEFAULT_LOANS_INPUT_VALUE,
  getOnBlurValue,
  getOnFocusValue,
  WithdrawCollateralPopupDataType,
} from './Modals.helpers'
import { withdrawCollateralAction } from 'pages/Loans/Actions/vaultCollateral.actions'

import { Input } from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { calcCollateralRatio } from 'pages/Loans/Loans.helpers'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239234&t=Sx2aEpp3ifrGxBtQ-0
export const WithdrawCollateral = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: WithdrawCollateralPopupDataType
}) => {
  const {
    selectedAsset,
    currentCollateralBalance = 0,
    vaultCollateralBalance = 0,
    vaultAddress,
    currentCollateralRatio = 0,
    collateralWithdrawAmount = 0,
    borrowedAmount = 0,
  } = data ?? {}

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { avaliableCollaterals } = useSelector((state: State) => state.tokens)

  const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)
  const [isActionPerforming, setIsActionPerforming] = useState(false)

  const isActionBtnDisabled = useMemo(
    () => isActionPerforming || inputData.validationStatus !== INPUT_STATUS_SUCCESS,
    [isActionPerforming, inputData.validationStatus],
  )
  const collateralData = useMemo(
    () => avaliableCollaterals.find(({ gqlName }) => selectedAsset?.gqlName === gqlName),
    [avaliableCollaterals, selectedAsset],
  )

  const inputAmount = isNaN(parseFloat(inputData.amount)) ? 0 : parseFloat(inputData.amount)

  const { futureCollateralRatio, futureCollateralWithdraw, futureVaultCollateralBalance } = useMemo(() => {
    const futureCollateralRatio = selectedAsset
      ? calcCollateralRatio(
          vaultCollateralBalance - inputAmount * Number(selectedAsset?.rate),
          borrowedAmount,
          selectedAsset.rate,
        )
      : 0

    const futureCollateralWithdraw = collateralWithdrawAmount - inputAmount
    const futureVaultCollateralBalance = vaultCollateralBalance - inputAmount * Number(selectedAsset?.rate)

    return { futureCollateralRatio, futureCollateralWithdraw, futureVaultCollateralBalance }
  }, [selectedAsset, vaultCollateralBalance, inputData.amount, borrowedAmount, collateralWithdrawAmount])

  useEffect(() => {
    if (!show) {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
      setIsActionPerforming(false)
    }
  }, [show])

  const inputOnChangeHandle = (newInputAmount: string, maxAmount: number) => {
    const parsedNewInputAmount = isNaN(parseFloat(newInputAmount)) ? 0 : parseFloat(newInputAmount)
    const validationStatus =
      parsedNewInputAmount > 0 && parsedNewInputAmount <= maxAmount ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR

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

  const withdrawHandler = async () => {
    if (vaultAddress && collateralData?.gqlName) {
      setIsActionPerforming(true)
      await dispatch(
        withdrawCollateralAction(
          Number(inputData.amount) * 10 ** collateralData.decimals,
          collateralData.gqlName,
          vaultAddress,
          closePopup,
        ),
      )
      setIsActionPerforming(false)
    }
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Withdraw Collateral from a Vault</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">Select one or multiple assets to remove as collateral from the vault.</div>

          <VaultModalOverview>
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(currentCollateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio:{' '}
                <CommaNumber
                  beginningText={`${currentCollateralRatio > 250 ? '+' : ''}`}
                  value={Math.max(0, Math.min(currentCollateralRatio, 250))}
                  endingText="%"
                  showDecimal
                  decimalsToShow={2}
                />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={Math.max(0, Math.min(((currentCollateralRatio - 100) / 150) * 100, 100))}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={vaultCollateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={collateralWithdrawAmount} className="value" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <hr />
          {collateralData ? (
            <Input
              className={`${
                collateralData?.rate ? 'input-with-rate' : ''
              } large-input pinned-dropdown withdrawCollateralInput`}
              inputProps={{
                value: inputData.amount,
                type: 'number',
                onBlur: inputOnBlurHandle,
                onFocus: onFocusHandler,
                onChange: (e) =>
                  inputOnChangeHandle(e.target.value, Math.min(collateralData.userBalance, currentCollateralBalance)),
              }}
              settings={{
                balance: collateralData.userBalance,
                balanceAsset: collateralData.symbol,
                useMaxHandler: () =>
                  inputOnChangeHandle(
                    String(Math.min(collateralData.userBalance, currentCollateralBalance)),
                    Math.min(collateralData.userBalance, currentCollateralBalance),
                  ),
                inputStatus: inputData.validationStatus,
                convertedValue: inputAmount * collateralData.rate,
              }}
            >
              <InputPinnedTokenInfo>
                {collateralData?.icon ? (
                  <div className="image-wrapper">
                    <img src={collateralData.icon} alt={collateralData.name + '-logo'} />
                  </div>
                ) : (
                  <Icon id="noImage" />
                )}{' '}
                {collateralData.symbol}
              </InputPinnedTokenInfo>
            </Input>
          ) : null}
          <div className="block-name">New Vault Status</div>
          <VaultModalOverview>
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(futureCollateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio:{' '}
                <CommaNumber
                  beginningText={`${futureCollateralRatio > 250 ? '+' : ''}`}
                  value={Math.max(0, Math.min(futureCollateralRatio, 250))}
                  endingText="%"
                  showDecimal
                  decimalsToShow={2}
                />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={Math.max(0, Math.min(((futureCollateralRatio - 100) / 150) * 100, 100))}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={futureVaultCollateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={futureCollateralWithdraw} className="value" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <NewButton
            kind={ACTION_PRIMARY}
            onClick={withdrawHandler}
            disabled={isActionBtnDisabled}
            className="modal-manage-btn"
          >
            <Icon id="minus" />
            Remove
          </NewButton>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

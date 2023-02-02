import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { COLLATERAL_RATIO_GRADIENT } from 'pages/Loans/Loans.const'
import { State } from 'reducers'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import {
  DEFAULT_LOANS_INPUT_VALUE,
  getOnBlurValue,
  getOnFocusValue,
  WithdrawCollateralPopupDataType,
} from './Modals.helpers'
import { withdrawCollateralAction } from 'pages/Loans/Actions/vaultCollateral.actions'
import { getAssetDisplayName } from 'pages/Loans/Loans.helpers'

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
  const { selectedAsset, currentCollateralValue = 0, currentAvaliableToWithdraw = 0, vaultAddress } = data ?? {}

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
  const assetName = getAssetDisplayName(collateralData?.gqlName)

  useEffect(() => {
    if (!show) {
      setInputData(DEFAULT_LOANS_INPUT_VALUE)
      setIsActionPerforming(false)
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

  const withdrawHandler = async () => {
    console.log('vaultAddress', vaultAddress)

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
              <CommaNumber value={currentCollateralValue} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={currentAvaliableToWithdraw} className="value" />
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
                  inputOnChangeHandle(e.target.value, Math.min(collateralData.userBalance, currentCollateralValue)),
              }}
              settings={{
                balance: collateralData.userBalance,
                balanceAsset: assetName,
                useMaxHandler: () =>
                  inputOnChangeHandle(
                    String(Math.min(collateralData.userBalance, currentCollateralValue)),
                    Math.min(collateralData.userBalance, currentCollateralValue),
                  ),
                inputStatus: inputData.validationStatus,
                convertedValue: Number(inputData.amount) * collateralData.rate,
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
                {assetName}
              </InputPinnedTokenInfo>
            </Input>
          ) : null}
          <div className="block-name">New Vault Status</div>
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
              <CommaNumber
                value={currentCollateralValue * Number(collateralData?.rate)}
                className="value"
                beginningText="$"
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Available To Withdraw</div>
              <CommaNumber value={currentAvaliableToWithdraw} className="value" />
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

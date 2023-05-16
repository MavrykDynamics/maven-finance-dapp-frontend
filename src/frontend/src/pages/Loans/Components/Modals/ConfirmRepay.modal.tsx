import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'
import { State } from 'reducers'

import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { INPUT_STATUS_SUCCESS, INPUT_STATUS_ERROR, INPUT_LARGE } from 'app/App.components/Input/Input.constants'
import { ConfirmRepayPartPopupDataType, DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue, RepayPartPopupDataType } from './Modals.helpers'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { repayPartOfVaultAction } from 'pages/Loans/Actions/vault.actions'

import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { Input } from 'app/App.components/Input/NewInput'
import colors from 'styles/colors'

import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { calcCollateralRatio, getLoansInputMaxAmount, loansInputValidation } from 'pages/Loans/Loans.helpers'


export const ConfirmRepay = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: ConfirmRepayPartPopupDataType
}) => {
  const {
    inputAmount = 0,
    vaultId,
    vaultAddress,
    borrowedAsset,
    currentCollateralBalance = 0,
    borrowCapacity = 0,
    borrowedAmount = 0,
    scrollToCurrentVault,
  } = data ?? {}

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = borrowedAsset
      ? calcCollateralRatio(currentCollateralBalance, borrowedAmount - inputAmount, borrowedAsset.rate)
      : 0

    const futureBorrowCapacity = Math.max(borrowCapacity + inputAmount, 0)
    return { futureCollateralRatio, futureBorrowCapacity }
  }, [borrowedAsset, currentCollateralBalance, borrowCapacity, inputAmount, borrowedAmount])

  const repayBtnHandler = async () => {
    if (vaultId && borrowedAsset && vaultAddress) {
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

          <div className="button-wrapper" style={{ marginTop: '40px' }}>
            <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={repayBtnHandler}>
              <Icon id="okIcon" />
              Repay
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

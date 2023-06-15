import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'

import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { ConfirmRepayPartPopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { repayPartOfVaultAction } from 'pages/Loans/Actions/vault.actions'

import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'

import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { calcCollateralRatio, getCollateralRatioByPersentage } from 'pages/Loans/Loans.helpers'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { AVALIABLE_TO_BORROW } from 'texts/tooltips/vault.text'
import { State } from 'reducers'
import colors from 'styles/colors'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

export const ConfirmRepay = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: ConfirmRepayPartPopupDataType
}) => {
  useLockBodyScroll(show)
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const dispatch = useDispatch()
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const borrowedToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata, tokensPrices })

  if (!data || !borrowedToken || !borrowedToken.rate) return null

  const {
    vaultId,
    vaultAddress,
    collateralBalance,
    borrowCapacity,
    borrowedAmount,
    inputAmount,
    scrollToCurrentVault,
  } = data

  const { symbol, rate } = borrowedToken

  const futureCollateralRatio = calcCollateralRatio(collateralBalance, borrowedAmount - inputAmount, rate)
  const futureBorrowCapacity = Math.max(borrowCapacity + inputAmount, 0)

  const repayBtnHandler = async () => {
    if (vaultId && vaultAddress && checkWhetherTokenIsLoanToken(borrowedToken)) {
      await dispatch(
        repayPartOfVaultAction(vaultId, vaultAddress, inputAmount, borrowedToken, closePopup, scrollToCurrentVault),
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
              <div className="value">{symbol}</div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Amount</div>
              <CommaNumber value={inputAmount} decimalsToShow={assetDecimalsToShow} className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem className="right">
              <div className="name">USD Value</div>
              <CommaNumber value={inputAmount * rate} className="value" beginningText="$" />
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
                currentPersentage={getCollateralRatioByPersentage(futureCollateralRatio)}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={collateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">
                Available To Borrow
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={colors[themeSelected].textColor}
                  text={AVALIABLE_TO_BORROW}
                  className="tooltip"
                />
              </div>
              <CommaNumber value={futureBorrowCapacity} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </VaultModalOverview>

          <div className="buttons-wrapper" style={{ marginTop: '40px' }}>
            <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={closePopup}>
              <Icon id="navigation-menu_close" />
              Cancel
            </NewButton>
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

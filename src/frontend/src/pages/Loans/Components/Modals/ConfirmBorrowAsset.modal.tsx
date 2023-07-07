import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'

import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { ConfirmBorrowPopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import Icon from 'app/App.components/Icon/Icon.view'

import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { borrowVaultAssetAction } from 'pages/Loans/Actions/vault.actions'
import { getCollateralRatioByPersentage } from 'pages/Loans/Loans.helpers'
import { AVALIABLE_TO_BORROW } from 'texts/tooltips/vault.text'
import { State } from 'reducers'
import colors from 'styles/colors'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getVaultCollateralRatio } from 'providers/LoansProvider/helpers/vaults.utils'
import { usePreferencesContext } from 'providers/PreferencesProvider/preferences.provider'

export const ConfirmBorrowAsset = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: ConfirmBorrowPopupDataType
}) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const { themeSelected } = usePreferencesContext()

  useLockBodyScroll(show)
  const dispatch = useDispatch()

  const borrowedToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata, tokensPrices })

  if (!data || !borrowedToken || !borrowedToken.rate) return null

  const { vaultId, borrowCapacity, inputAmount, borrowedAmount, collateralBalance, DAOFee, callback } = data ?? {}

  const { symbol, rate } = borrowedToken

  const futureCollateralRatio = getVaultCollateralRatio(collateralBalance, (borrowedAmount + inputAmount) * rate)

  const futureBorrowCapacity = borrowCapacity - inputAmount * rate

  const borrowAsserHandler = () => {
    if (vaultId && checkWhetherTokenIsLoanToken(borrowedToken)) {
      dispatch(
        borrowVaultAssetAction(vaultId, inputAmount, borrowedToken, () => {
          closePopup()
          callback()
        }),
      )
    }
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Confirm Borrow {symbol}</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">Please confirm the following details.</div>

          <div className="lending-stats" style={{ marginBottom: '30px' }}>
            <ThreeLevelListItem>
              <div className="name">
                Total Amount
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={colors[themeSelected].textColor}
                  text={`Total amount you are borrowing, a portion of which is paid to the treasury as the DAO fee. The amount you will actually receive is the Total Amount minus the DAO fee.`}
                  className="tooltip"
                />
              </div>
              <CommaNumber value={inputAmount} decimalsToShow={assetDecimalsToShow} className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Amount Received</div>
              <CommaNumber
                value={inputAmount - inputAmount * (DAOFee / 100)}
                decimalsToShow={assetDecimalsToShow}
                className="value"
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">
                DAO Fee
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={colors[themeSelected].textColor}
                  text={`Amount paid to the DAO as the origination fee for borrowing. Each time you borrow, a fee is paid.`}
                  className="tooltip"
                />
              </div>
              <CommaNumber
                value={inputAmount * (DAOFee / 100)}
                decimalsToShow={assetDecimalsToShow}
                className="value"
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">USD Value</div>
              <CommaNumber
                value={(inputAmount - inputAmount * (DAOFee / 100)) * rate}
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
            <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={borrowAsserHandler}>
              <Icon id="coin-loan" />
              Borrow {symbol}
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

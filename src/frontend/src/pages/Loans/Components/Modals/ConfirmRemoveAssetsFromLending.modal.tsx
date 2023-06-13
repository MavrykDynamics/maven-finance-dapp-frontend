import { useDispatch } from 'react-redux'
import { useLockBodyScroll } from 'react-use'

import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { ConfirmRemoveLendingAssetDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { withdrawLendingAssetAction } from 'pages/Loans/Actions/lendingAsset.actions'

import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase } from './Modals.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { checkWhetherTokenIsLoanToken } from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

export const ConfirmRemoveAssetsFromLending = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data?: ConfirmRemoveLendingAssetDataType
}) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  useLockBodyScroll(show)

  const dispatch = useDispatch()

  if (!data) return null

  const { tokenAddress, currentLendedAmount, inputAmount } = data

  const loanToken = tokensMetadata[tokenAddress]
  const { symbol } = loanToken
  const rate = tokensPrices[symbol]

  const withdrawHandler = () => {
    if (checkWhetherTokenIsLoanToken(loanToken)) {
      dispatch(withdrawLendingAssetAction(inputAmount, loanToken, closePopup))
    }
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <H2Title>Confirm Asset Withdrawal</H2Title>

          <div className="modalDescr">Please confirm the amount you would like to withdraw from Earning.</div>

          <div className="loans-confirmation-info">
            <div className="lending-stats">
              <ThreeLevelListItem>
                <div className="name">Amount To Withdraw</div>
                <CommaNumber value={inputAmount} className="value" endingText={symbol} />
              </ThreeLevelListItem>
              <ThreeLevelListItem className="right">
                <div className="name">USD Value</div>
                <CommaNumber value={inputAmount * rate} className="value" beginningText="$" />
              </ThreeLevelListItem>
            </div>
            <hr />
            <div className="lending-stats">
              <ThreeLevelListItem>
                <div className="name">New Earning Amount</div>
                <CommaNumber value={currentLendedAmount - inputAmount} className="value" endingText={symbol} />
              </ThreeLevelListItem>
              <ThreeLevelListItem className="right">
                <div className="name">New USD Value</div>
                <CommaNumber value={(currentLendedAmount - inputAmount) * rate} className="value" beginningText="$" />
              </ThreeLevelListItem>
            </div>
          </div>

          <div className="buttons-wrapper" style={{ marginTop: '40px' }}>
            <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={closePopup}>
              <Icon id="navigation-menu_close" />
              Cancel
            </NewButton>
            <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={withdrawHandler}>
              <Icon id="sign" />
              Confirm Withdraw
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

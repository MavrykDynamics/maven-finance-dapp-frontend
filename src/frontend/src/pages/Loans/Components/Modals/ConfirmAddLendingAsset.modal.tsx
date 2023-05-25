import { useDispatch } from 'react-redux'
import { useLockBodyScroll } from 'react-use'

import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { ConfirmAddLendingAssetDataType } from './Modals.helpers'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { depositLendingAssetAction } from 'pages/Loans/Actions/lendingAsset.actions'

import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'

import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { LENDING_APY } from 'texts/tooltips/loan.text'

export const ConfirmAddLendingAsset = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: ConfirmAddLendingAssetDataType
}) => {
  const {
    inputAmount = 0,
    mBalance = 0,
    rate = 0,
    decimals = 0,
    symbol = '',
    address = '',
    lendingAPY = 0,
    icon = '',
    gqlName = '',
    tokenType = '',
    id = 0,
  } = data ?? {}
  useLockBodyScroll(show)

  const dispatch = useDispatch()

  const depositHandler = () => {
    if (tokenType && address) {
      dispatch(depositLendingAssetAction(gqlName, inputAmount, address, id, tokenType, decimals, closePopup))
    }
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <H2Title>Confirm Supplying Asset</H2Title>

          <div className="modalDescr">Please confirm the amount you would like to supplying to Earning.</div>

          <div className="lending-stats" style={{ marginTop: '45px' }}>
            <ThreeLevelListItem>
              <div className="name">
                Lending APY
                <CustomTooltip iconId="info" text={LENDING_APY(symbol)} className="tooltip" />
              </div>
              <CommaNumber value={lendingAPY} className="value" endingText="%" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">m{symbol} Received</div>
              <CommaNumber value={inputAmount} className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">New m{symbol} Balance</div>
              <CommaNumber value={mBalance + inputAmount} className="value" />
            </ThreeLevelListItem>
          </div>

          <div className="buttons-wrapper" style={{ marginTop: '40px' }}>
            <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={closePopup}>
              <Icon id="navigation-menu_close" />
              Cancel
            </NewButton>
            <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={depositHandler}>
              <Icon id="sign" />
              Confirm Deposit
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

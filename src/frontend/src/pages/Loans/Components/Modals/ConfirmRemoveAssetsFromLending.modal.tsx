import { useLockBodyScroll } from 'react-use'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

// consts
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { ConfirmRemoveLendingAssetDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { DEPOSIT_LENDING_ASSET_ACTION } from 'providers/LoansProvider/helpers/loans.const'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'

// actions
import { withdrawLendingAssetAction } from 'providers/LoansProvider/actions/loans.actions'

// styles
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase } from './Modals.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// helpers
import { sleep } from 'utils/api/sleep'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { isContractErrorPayload } from 'errors/helpers/walletError.helper'
import { checkIfActionSuccess } from 'providers/DappConfigProvider/helpers/dappAction.helpers'
import { unknownToError } from 'errors/error'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { TezosWalletErrorPayload } from 'errors/error.type'

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
  const {
    contractAddresses: { lendingControllerAddress },
    toggleActionFullScreenLoader,
    toggleActionCompletion,
    setAction,
  } = useDappConfigContext()
  const { bug, info, loading } = useToasterContext()
  const { userAddress } = useUserContext()

  useLockBodyScroll(show)

  const loanToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata, tokensPrices })

  if (!data || !loanToken || !loanToken.rate) return null

  const { currentLendedAmount, inputAmount, callback } = data
  const { symbol, rate } = loanToken

  const withdrawHandler = async () => {
    if (checkWhetherTokenIsLoanToken(loanToken)) {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return
      }
      if (!lendingControllerAddress) {
        bug('Wrong lending address')
        return
      }

      try {
        const actionResult = await withdrawLendingAssetAction(lendingControllerAddress, inputAmount, loanToken, () => {
          closePopup()
          callback()
        })

        if (checkIfActionSuccess(actionResult)) {
          const { operation } = actionResult
          toggleActionFullScreenLoader(true)
          toggleActionCompletion(true)

          info(
            TOASTER_ACTIONS_TEXTS[DEPOSIT_LENDING_ASSET_ACTION]['start']['message'],
            TOASTER_ACTIONS_TEXTS[DEPOSIT_LENDING_ASSET_ACTION]['start']['title'],
          )

          await sleep(5000)

          // show toaster loader after 5000ms after operation started
          const toasterId = loading(
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          )

          toggleActionFullScreenLoader(false)

          const operationConfirm = await operation.confirmation()
          const operationLvl = operationConfirm.block.header.level

          setAction({ actionName: DEPOSIT_LENDING_ASSET_ACTION, toasterId, operationLvl })
        } else if (isContractErrorPayload(actionResult.error)) {
          const { message, description } = actionResult.error as TezosWalletErrorPayload
          bug(description, message)
        } else {
          throw new Error(actionResult.error.message)
        }
      } catch (e) {
        setAction(null)
        const parsedError = unknownToError(e)
        bug(parsedError.message)
      }
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

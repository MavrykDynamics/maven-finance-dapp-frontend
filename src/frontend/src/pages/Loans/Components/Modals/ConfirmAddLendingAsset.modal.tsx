import { useLockBodyScroll } from 'react-use'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// consts
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { LENDING_APY } from 'texts/tooltips/loan.text'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { DEPOSIT_LENDING_ASSET_ACTION } from 'providers/LoansProvider/helpers/loans.const'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'

// types
import { ConfirmAddLendingAssetDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { TezosWalletErrorPayload } from 'errors/error.type'

// actions
import { depositLendingAssetAction } from 'providers/LoansProvider/actions/loans.actions'

// styles
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// helpers
import { unknownToError } from 'errors/error'
import { sleep } from 'utils/api/sleep'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { checkIfActionSuccess } from 'providers/DappConfigProvider/helpers/dappAction.helpers'
import { isContractErrorPayload } from 'errors/helpers/walletError.helper'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export const ConfirmAddLendingAsset = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: ConfirmAddLendingAssetDataType
}) => {
  const { tokensMetadata } = useTokensContext()
  const { bug, loading, info } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    contractAddresses: { lendingControllerAddress },
    toggleActionFullScreenLoader,
    toggleActionCompletion,
    setAction,
  } = useDappConfigContext()

  useLockBodyScroll(show)

  const loanToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata })

  if (!data || !loanToken || !loanToken.rate) return null

  const { mBalance, inputAmount, lendingAPY, callback } = data
  const { symbol } = loanToken

  const depositHandler = async () => {
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
        const actionResult = await depositLendingAssetAction(
          userAddress,
          loanToken,
          inputAmount,
          lendingControllerAddress,
          () => {
            closePopup()
            callback()
          },
        )

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

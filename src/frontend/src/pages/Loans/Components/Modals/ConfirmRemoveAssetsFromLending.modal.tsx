import { useCallback, useMemo } from 'react'
import { useLockBodyScroll } from 'react-use'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

// consts
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { ConfirmRemoveLendingAssetDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { WITHDRAW_LENDING_ASSET_ACTION } from 'providers/LoansProvider/helpers/loans.const'

// actions
import { withdrawLendingAssetAction } from 'providers/LoansProvider/actions/loans.actions'

// styles
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase } from './Modals.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// helpers
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

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
  } = useDappConfigContext()
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()

  useLockBodyScroll(show)

  const loanToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata, tokensPrices })

  const { currentLendedAmount = 0, inputAmount = 0, callback = () => {} } = data ?? {}
  const { symbol = '', rate: originalRate } = loanToken ?? {}
  const rate = originalRate ?? 0

  const withdrawCb = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!lendingControllerAddress) {
      bug('Wrong lending address')
      return null
    }

    if (loanToken && checkWhetherTokenIsLoanToken(loanToken)) {
      return await withdrawLendingAssetAction(lendingControllerAddress, inputAmount, loanToken, () => {
        closePopup()
        callback()
      })
    }

    return null
  }, [bug, callback, closePopup, inputAmount, lendingControllerAddress, loanToken, userAddress])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: WITHDRAW_LENDING_ASSET_ACTION,
      actionFn: withdrawCb,
    }),
    [withdrawCb],
  )

  const { action: withdrawHandler } = useContractAction(contractActionProps)

  if (!data || !loanToken || !loanToken.rate) return null

  return (
    <PopupContainer onClick={closePopup} $show={show}>
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

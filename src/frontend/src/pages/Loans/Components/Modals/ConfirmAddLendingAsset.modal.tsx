import { useCallback, useMemo } from 'react'
import { useLockBodyScroll } from 'react-use'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// consts
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { LENDING_APY } from 'texts/tooltips/loan.text'
import { DEPOSIT_LENDING_ASSET_ACTION } from 'providers/LoansProvider/helpers/loans.const'

// types
import { ConfirmAddLendingAssetDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'

// actions
import { depositLendingAssetAction } from 'providers/LoansProvider/actions/loans.actions'

// styles
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// helpers
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import colors from 'styles/colors'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

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
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    contractAddresses: { lendingControllerAddress },
  } = useDappConfigContext()

  useLockBodyScroll(show)

  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const loanToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata })
  const { mBalance = 0, inputAmount = 0, lendingAPY = 0, callback = () => {} } = data ?? {}
  const { symbol } = loanToken ?? {}

  const depositAction = useCallback(async () => {
    if ((loanToken && !checkWhetherTokenIsLoanToken(loanToken)) || !loanToken) {
      return null
    }

    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!lendingControllerAddress) {
      bug('Wrong lending address')
      return null
    }

    return await depositLendingAssetAction(userAddress, loanToken, inputAmount, lendingControllerAddress, () => {
      closePopup()
      callback()
    })
  }, [bug, callback, closePopup, inputAmount, lendingControllerAddress, loanToken, userAddress])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DEPOSIT_LENDING_ASSET_ACTION,
      actionFn: depositAction,
    }),
    [depositAction],
  )

  const depositHandler = useContractAction(contractActionProps)

  if (!data || !loanToken || !loanToken.rate || !symbol) return null

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
                <CustomTooltip
                  iconId="info"
                  text={LENDING_APY(symbol)}
                  defaultStrokeColor={colors[themeSelected].subHeadingText}
                  className="tooltip"
                />
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

import { useCallback, useMemo } from 'react'
import { useLockBodyScroll } from 'react-use'

// consts
import { COLLATERAL_RATIO_GRADIENT, getCollateralRatioPercentColor } from 'pages/Loans/Loans.const'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { AVALIABLE_TO_BORROW } from 'texts/tooltips/vault.text'
import {
  MAX_SHOWN_COLLATERAL_RATIO_PERSENT,
  REPAY_FULL_VAULT_ACTION,
} from 'providers/VaultsProvider/helpers/vaults.const'

// actions
import { repayFullAndCloseVaultAction } from 'providers/VaultsProvider/actions/vaults.actions'

// components
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// styles
import colors from 'styles/colors'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'

// helpers
import { getCollateralRatioByPercentage } from 'pages/Loans/Loans.helpers'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// types
import { ConfirmRepayFullPopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction/useContractAction'
import { operationRepay, useVaultFutureStats } from 'providers/VaultsProvider/hooks/useVaultFutureStats'
import { useLocation, useNavigate } from 'react-router'

export const ConfirmRepayFull = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: ConfirmRepayFullPopupDataType
}) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const location = useLocation()
  const navigate = useNavigate()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])

  const {
    preferences: { themeSelected },
    contractAddresses: { lendingControllerAddress },
  } = useDappConfigContext()

  useLockBodyScroll(show)

  const {
    repayAmount,
    vaultId,
    vaultAddress,
    collateralBalance,
    availableLiquidity,
    totalOutstanding,
    tokenAddress: vaultTokenAddress,
    callback,
  } = data

  const borrowedToken = getTokenDataByAddress({ tokenAddress: vaultTokenAddress, tokensMetadata, tokensPrices })
  const { symbol = '', rate: originalRate } = borrowedToken ?? {}
  const rate = originalRate ?? 0

  const { futureCollateralRatio, futureBorrowCapacity } = useVaultFutureStats({
    vaultCurrentTotalOutstanding: totalOutstanding,
    vaultCurrentCollateralBalance: collateralBalance,
    vaultTokenAddress,
    operationType: operationRepay,
    inputValue: repayAmount,
    marketAvailableLiquidity: availableLiquidity,
  })

  // repay full action
  const fullRepayAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!lendingControllerAddress) {
      bug('Wrong lending address')
      return null
    }
    if (borrowedToken && vaultId && vaultAddress && checkWhetherTokenIsLoanToken(borrowedToken)) {
      return await repayFullAndCloseVaultAction(
        lendingControllerAddress,
        userAddress,
        vaultId,
        vaultAddress,
        repayAmount,
        borrowedToken,
      )
    }

    return null
  }, [borrowedToken, bug, lendingControllerAddress, repayAmount, userAddress, vaultAddress, vaultId])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REPAY_FULL_VAULT_ACTION,
      actionFn: fullRepayAction,
      successActionCallback: () => {
        closePopup()
        callback()
      },
      dappActionCallback: () => {
        params.delete('vaultAddress')
        navigate({ ...location, search: params.toString() }, { replace: true })
      },
    }),
    [callback, closePopup, fullRepayAction, location, navigate, params],
  )

  const { action: repayBtnHandler } = useContractAction(contractActionProps)

  if (!data || !borrowedToken || !borrowedToken.rate) return null

  return (
    <PopupContainer onClick={closePopup} $show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Confirm Repayment & Vault Closure</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">
            Fully repay the loan and close your vault. Your collateral will automatically be withdrawn to your wallet.
          </div>

          <div className="lending-stats" style={{ marginBottom: '25px' }}>
            <ThreeLevelListItem>
              <div className="name">Asset</div>
              <div className="value">{symbol}</div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Amount</div>
              <CommaNumber value={repayAmount} className="value" />
            </ThreeLevelListItem>
            <ThreeLevelListItem className="right">
              <div className="name">USD Value</div>
              <CommaNumber value={repayAmount * rate} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </div>

          <div className="block-name">New Vault Stats</div>
          <VaultModalOverview>
            <ThreeLevelListItem
              className="collateral-diagram"
              $customColor={getCollateralRatioPercentColor(colors[themeSelected], futureCollateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio:{' '}
                <CommaNumber
                  value={Math.min(MAX_SHOWN_COLLATERAL_RATIO_PERSENT, futureCollateralRatio)}
                  endingText="%"
                  showDecimal
                  decimalsToShow={2}
                  beginningText={futureCollateralRatio > MAX_SHOWN_COLLATERAL_RATIO_PERSENT ? '+' : ''}
                />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPercentage={getCollateralRatioByPercentage(futureCollateralRatio)}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Value</div>
              <CommaNumber value={collateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">
                Available To Borrow
                <Tooltip>
                  <Tooltip.Trigger className="ml-3">
                    <Icon id="info" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>{AVALIABLE_TO_BORROW}</Tooltip.Content>
                </Tooltip>
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
              <Icon id="close" />
              Repay And Close
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

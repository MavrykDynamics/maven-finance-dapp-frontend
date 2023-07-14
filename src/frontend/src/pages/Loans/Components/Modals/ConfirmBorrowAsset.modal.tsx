import { useCallback, useMemo } from 'react'
import { useLockBodyScroll } from 'react-use'

// consts
import { BORROW_VAULT_ASSET_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { COLLATERAL_RATIO_GRADIENT, assetDecimalsToShow, getCollateralRationPersent } from 'pages/Loans/Loans.const'
import { ConfirmBorrowPopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { AVALIABLE_TO_BORROW } from 'texts/tooltips/vault.text'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import Icon from 'app/App.components/Icon/Icon.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// styles
import colors from 'styles/colors'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { LoansModalBase, VaultModalOverview } from './Modals.style'

// helpers & actions
import { borrowVaultAssetAction } from 'providers/VaultsProvider/actions/vaults.actions'
import { getCollateralRatioByPersentage } from 'pages/Loans/Loans.helpers'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

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
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const {
    preferences: { themeSelected },
    contractAddresses: { lendingControllerAddress },
  } = useDappConfigContext()

  useLockBodyScroll(show)
  const borrowedToken = getTokenDataByAddress({ tokenAddress: data?.tokenAddress, tokensMetadata, tokensPrices })

  const {
    vaultId = 0,
    borrowCapacity = 0,
    inputAmount = 0,
    borrowedAmount = 0,
    collateralBalance = 0,
    DAOFee = 0,
    callback = () => {},
  } = data ?? {}
  const { symbol = '', rate: originalRate } = borrowedToken ?? {}
  const rate = originalRate ?? 0

  const futureCollateralRatio = getVaultCollateralRatio(collateralBalance, (borrowedAmount + inputAmount) * rate)

  const futureBorrowCapacity = borrowCapacity - inputAmount * rate

  // borrow action
  const borrowAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!lendingControllerAddress) {
      bug('Wrong lending address')
      return null
    }

    if (borrowedToken && vaultId && checkWhetherTokenIsLoanToken(borrowedToken)) {
      return await borrowVaultAssetAction(lendingControllerAddress, vaultId, inputAmount, borrowedToken, () => {
        closePopup()
        callback()
      })
    }

    return null
  }, [borrowedToken, bug, callback, closePopup, inputAmount, lendingControllerAddress, userAddress, vaultId])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: BORROW_VAULT_ASSET_ACTION,
      actionFn: borrowAction,
    }),
    [borrowAction],
  )

  const borrowAsserHandler = useContractAction(contractActionProps)

  if (!data || !borrowedToken || !borrowedToken.rate) return null

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

// consts
import { SECONDARY_TRANSACTION_HISTORY_STYLE } from '../Loans.const'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

// view
import { LendingTabStyled, NoItemsInTabStyled } from './LoansComponents.style'
import { TransactionHistory } from './TransactionHistory'
import { LendingTabValuesSection } from './LendingTabSections/LendingTabValuesSection'
import { LendingTabActionsSection } from './LendingTabSections/LendingTabActionsSection'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

// types
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

// hooks
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type LendingTabPropsType = {
  loanTokenAddress: TokenAddressType
  loanMtokenAddress: TokenAddressType
  lendAPY: number
  marketAvailableLiquidity: number
}

export const LendingTab = ({
  loanTokenAddress,
  loanMtokenAddress,
  lendAPY,
  marketAvailableLiquidity,
}: LendingTabPropsType) => {
  const { openAddLendingAssetPopup } = useLoansPopupsContext()
  const { userMTokens, userAddress } = useUserContext()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const lendingItem = userMTokens[loanMtokenAddress]

  return (
    <LendingTabStyled>
      {lendingItem ? (
        <div className="stats-and-actions">
          <LendingTabValuesSection lendingItem={lendingItem} loanTokenAddress={loanTokenAddress} lendAPY={lendAPY} />
          <LendingTabActionsSection
            lendingItem={lendingItem}
            loanTokenAddress={loanTokenAddress}
            lendAPY={lendAPY}
            marketAvailableLiquidity={marketAvailableLiquidity}
          />
        </div>
      ) : (
        <NoItemsInTabStyled>
          <span>Supply assets to earn interest.</span>

          <div className="manage-btn">
            <Button
              kind={BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              disabled={!Boolean(userAddress) || isActionActive}
              onClick={() =>
                openAddLendingAssetPopup({
                  mBalance: 0,
                  lendingAPY: lendAPY,
                  tokenAddress: loanTokenAddress,
                })
              }
            >
              <Icon id="plus" />
              Supply Asset
            </Button>
          </div>
        </NoItemsInTabStyled>
      )}

      {userAddress && (
        <TransactionHistory
          loanTokenAddress={loanTokenAddress}
          filterByDescriptions={[0, 1]}
          userAddress={userAddress}
          styleType={SECONDARY_TRANSACTION_HISTORY_STYLE}
        />
      )}
    </LendingTabStyled>
  )
}

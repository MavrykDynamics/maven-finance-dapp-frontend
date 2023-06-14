import { useSelector } from 'react-redux'

import { State } from 'reducers'

import { SECONDARY_TRANSACTION_HISTORY_STYLE } from '../Loans.const'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import { LendingTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

import { TransactionHistory } from './TransactionHistory'
import { LendingTabValuesSection } from './LendingTabSections/LendingTabValuesSection'
import { LendingTabActionsSection } from './LendingTabSections/LendingTabActionsSection'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { getMarketUserLengingItem } from 'providers/LoansProvider/helpers/loans.utils'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'

type LendingTabPropsType = {
  loanTokenAddress: TokenAddressType
  loanMtokenAddress: TokenAddressType
  lendAPY: number
}

export const LendingTab = ({ loanTokenAddress, loanMtokenAddress, lendAPY }: LendingTabPropsType) => {
  const { openAddLendingAssetPopup } = useLoansPopupsContext()

  const {
    accountPkh,
    user: { userMTokens },
  } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const lendingItem = getMarketUserLengingItem(userMTokens, loanMtokenAddress)

  return (
    <LendingTabStyled>
      {lendingItem ? (
        <div className="stats-and-actions">
          <LendingTabValuesSection lendingItem={lendingItem} loanTokenAddress={loanTokenAddress} lendAPY={lendAPY} />
          <LendingTabActionsSection lendingItem={lendingItem} loanTokenAddress={loanTokenAddress} lendAPY={lendAPY} />
        </div>
      ) : (
        <NoItemsInTabStyled>
          <span>Lend assets to earn interest.</span>

          <div className="manage-btn">
            <Button
              kind={BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              disabled={!Boolean(accountPkh) || isActionActive}
              onClick={() =>
                openAddLendingAssetPopup({
                  mBalance: 0,
                  lendingAPY: lendAPY,
                  tokenAddress: loanTokenAddress,
                })
              }
            >
              <Icon id="plus" />
              Lend Asset
            </Button>
          </div>
        </NoItemsInTabStyled>
      )}

      {accountPkh && (
        <TransactionHistory
          loanTokenAddress={loanTokenAddress}
          filterByDescriptions={['Liquidity Added', 'Liquidity Removed']}
          userAddress={accountPkh}
          styleType={SECONDARY_TRANSACTION_HISTORY_STYLE}
        />
      )}
    </LendingTabStyled>
  )
}

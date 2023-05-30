import { useSelector } from 'react-redux'
import { useContext, useMemo } from 'react'

import { State } from 'reducers'
import { LendingItemType, LoanMarketType } from 'utils/TypesAndInterfaces/Loans'

import { SECONDARY_TRANSACTION_HISTORY_STYLE } from '../Loans.const'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { loansPopupsContext } from './Modals/LoansModals.provider'

import { LendingTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

import { TransactionHistory } from './TransactionHistory'
import { LendingTabValuesSection } from './LendingTabSections/LendingTabValuesSection'
import { LendingTabActionsSection } from './LendingTabSections/LendingTabActionsSection'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

type LendingTabPropsType = {
  lendingItem: LendingItemType
  lendingControllerAddress: string
  assetData: LoanMarketType['loanTokenData']
  lendAPY: number
}

export const LendingTab = ({ lendingItem, lendingControllerAddress, assetData, lendAPY }: LendingTabPropsType) => {
  const { openAddLendingAssetPopup } = useContext(loansPopupsContext)
  const { loanTokens } = useSelector((state: State) => state.loans)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const transactionHistory = useMemo(() => {
    return loanTokens.find(({ loanTokenData }) => loanTokenData.symbol === assetData.symbol)?.transactionHistory ?? []
  }, [assetData, loanTokens])

  return (
    <LendingTabStyled>
      {lendingItem ? (
        <div className="stats-and-actions">
          <LendingTabValuesSection lendingItem={lendingItem} assetData={assetData} lendAPY={lendAPY} />
          <LendingTabActionsSection lendingItem={lendingItem} assetData={assetData} lendAPY={lendAPY} />
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
                  ...assetData,
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
          transactionHistory={transactionHistory}
          filterByDescriptions={['Liquidity Added', 'Liquidity Removed']}
          userAddress={accountPkh}
          lendingControllerAddress={lendingControllerAddress}
          styleType={SECONDARY_TRANSACTION_HISTORY_STYLE}
        />
      )}
    </LendingTabStyled>
  )
}

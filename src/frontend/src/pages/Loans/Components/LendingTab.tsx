import { useSelector } from 'react-redux'
import { useMemo } from 'react'

import { State } from 'reducers'
import { LendingItemType, LoanMarketType } from 'utils/TypesAndInterfaces/Loans'

import { SECONDARY_TRANSACTION_HISTORY_STYLE } from '../Loans.const'

import { LendingTabStyled } from './LoansComponents.style'

import { TransactionHistory } from './TransactionHistory'
import { LendingTabValuesSection } from './LendingTabSections/LendingTabValuesSection'
import { LendingTabActionsSection } from './LendingTabSections/LendingTabActionsSection'

type LendingTabPropsType = {
  lendingItem: LendingItemType
  lendingControllerAddress: string
  assetData: LoanMarketType['loanTokenData']
  lendAPY: number
}

export const LendingTab = ({ lendingItem, lendingControllerAddress, assetData, lendAPY }: LendingTabPropsType) => {
  const { loanTokens } = useSelector((state: State) => state.loans)

  const transactionHistory = useMemo(() => {
    return loanTokens.find(({ loanTokenData }) => loanTokenData.symbol === assetData.symbol)?.transactionHistory ?? []
  }, [assetData, loanTokens])

  return (
    <LendingTabStyled>
      {lendingItem && (
        <div className="stats-and-actions">
          <LendingTabValuesSection lendingItem={lendingItem} assetData={assetData} lendAPY={lendAPY} />
          <LendingTabActionsSection lendingItem={lendingItem} assetData={assetData} lendAPY={lendAPY} />
        </div>
      )}

      <TransactionHistory
        transactionHistory={transactionHistory}
        lendingControllerAddress={lendingControllerAddress}
        styleType={SECONDARY_TRANSACTION_HISTORY_STYLE}
      />
    </LendingTabStyled>
  )
}

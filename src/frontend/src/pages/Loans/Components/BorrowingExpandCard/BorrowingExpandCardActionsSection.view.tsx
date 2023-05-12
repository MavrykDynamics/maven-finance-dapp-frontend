import { useState } from 'react'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { BorrowingTabListItemSection, BorrowingTabListItemSectionInfo } from '../LoansComponents.style'
import { VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS, VAULT_CARD_REPAY_SLIDING_BUTTONS } from 'pages/Loans/Loans.const'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

type Props = {}

export const BorrowingExpandCardActionsSection = ({}: Props) => {
  const [activeRepayBorrowTab, setActiveRepayBorrowTab] = useState(
    VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS.find((item) => item.active),
  )
  const [activeRepayTab, setActiveRepayTab] = useState(VAULT_CARD_REPAY_SLIDING_BUTTONS.find((item) => item.active))

  const handleSwitchTab = (setActiveTab: (tab?: TabItem) => void) => (tabId: number) => {
    const tabs = VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS.concat(VAULT_CARD_REPAY_SLIDING_BUTTONS)

    setActiveTab(tabs.find((item) => item.id === tabId))
  }

  return (
    <BorrowingTabListItemSection>
      <BorrowingTabListItemSectionInfo className="action-switchers">
        <SlidingTabButtons
          onClick={handleSwitchTab(setActiveRepayBorrowTab)}
          tabItems={VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS}
          className="vault"
        />
        <SlidingTabButtons
          onClick={handleSwitchTab(setActiveRepayTab)}
          tabItems={VAULT_CARD_REPAY_SLIDING_BUTTONS}
          className="vault"
        />
      </BorrowingTabListItemSectionInfo>
    </BorrowingTabListItemSection>
  )
}

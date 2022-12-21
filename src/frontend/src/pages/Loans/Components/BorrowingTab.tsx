import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

type BorrowingTabPropsType = {
  borrowingItems: Array<any>
}

export const BorrowingTab = ({ borrowingItems }: BorrowingTabPropsType) => {
  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Boorrowing</h2>
      </GovRightContainerTitleArea>

      {borrowingItems.length ? (
        <div className="list-wrapper"></div>
      ) : (
        <NoItemsInTabStyled>
          <span>To borrow, you must first create a vault and add collateral.</span>
          <Button text="New Vault" icon="plus" kind={ACTION_PRIMARY} className="lending-tab-no-items-btn" />
        </NoItemsInTabStyled>
      )}
    </LoansTabStyled>
  )
}

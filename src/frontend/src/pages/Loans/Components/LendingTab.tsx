import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

type LendingTabPropsType = {
  lendingItems: Array<any>
}

export const LendingTab = ({ lendingItems }: LendingTabPropsType) => {
  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Lending</h2>
      </GovRightContainerTitleArea>

      {lendingItems.length ? (
        <div className="list-wrapper"></div>
      ) : (
        <NoItemsInTabStyled>
          <span>Lend assets to earn interest.</span>
          <Button text="Lend Asset" icon="plus" kind={ACTION_PRIMARY} className="lending-tab-no-items-btn" />
        </NoItemsInTabStyled>
      )}
    </LoansTabStyled>
  )
}

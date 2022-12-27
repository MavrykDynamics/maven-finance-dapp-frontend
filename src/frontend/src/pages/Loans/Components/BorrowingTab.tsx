import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { useDispatch } from 'react-redux'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'
import { BorrowingExpandCard } from './BorrowindExpandCard'
import { LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

type BorrowingTabPropsType = {
  borrowingItems: Array<BorrowingData>
}

export const BorrowingTab = ({ borrowingItems }: BorrowingTabPropsType) => {
  const dispatch = useDispatch()

  const createVaultHandler = () => {}

  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Boorrowing</h2>
      </GovRightContainerTitleArea>

      {borrowingItems.length ? (
        <>
          <Button
            text="New Vault"
            icon="plus"
            onClick={createVaultHandler}
            kind={ACTION_PRIMARY}
            className="lending-tab-no-items-btn has-items-borrow-btn"
          />
          <div className="list-wrapper">
            {borrowingItems.map((item) => {
              return <BorrowingExpandCard showFull {...item} />
            })}
          </div>
        </>
      ) : (
        <NoItemsInTabStyled>
          <span>To borrow, you must first create a vault and add collateral.</span>
          <Button
            text="New Vault"
            icon="plus"
            kind={ACTION_PRIMARY}
            onClick={createVaultHandler}
            className="lending-tab-no-items-btn"
          />
        </NoItemsInTabStyled>
      )}
    </LoansTabStyled>
  )
}

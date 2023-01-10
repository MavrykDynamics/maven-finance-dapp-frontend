import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'
import { BorrowingExpandCard } from './BorrowindExpandCard'
import { LoansTabStyled } from './LoansComponents.style'

type PermissionVaultsPropsType = {
  permissionVaults: Array<BorrowingData>
}

export const PermissionVaults = ({ permissionVaults }: PermissionVaultsPropsType) => {
  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>Permissions Vaults</h2>
      </GovRightContainerTitleArea>

      {permissionVaults.length ? (
        <div className="list-wrapper">
          {permissionVaults.map((item) => {
            return <BorrowingExpandCard {...item} />
          })}
        </div>
      ) : (
        <EmptyContainer
          style={{
            padding: '30px 0 20px 0',
          }}
        >
          <img src="/images/not-found.svg" alt=" No Transaction History to show" />
          <figcaption>You don't have permissions to any vault</figcaption>
        </EmptyContainer>
      )}
    </LoansTabStyled>
  )
}

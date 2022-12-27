import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { BorrowingExpandCard } from './BorrowindExpandCard'
import { LoansTabStyled } from './LoansComponents.style'

type PermissionVaultsPropsType = {
  permissionVaults: Array<any>
}

export const PermissionVaults = ({ permissionVaults }: PermissionVaultsPropsType) => {
  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>Permissions Vaults</h2>
      </GovRightContainerTitleArea>

      {permissionVaults.length || true ? (
        <div className="list-wrapper">
          <BorrowingExpandCard
            borrowedAsset={{
              assetSymbol: '',
              assetIcon: undefined,
              amtBorrowed: 0,
              assetRate: 0,
              collateralBalance: 0,
              collateralUtilization: 0,
              apy: 0,
              fee: 0,
            }}
            collateralData={[]}
          />
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

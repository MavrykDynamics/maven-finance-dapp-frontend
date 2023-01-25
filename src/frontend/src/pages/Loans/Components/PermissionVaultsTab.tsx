import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'
import { BorrowingExpandCard } from './BorrowindExpandCard'
import { LoansTabStyled } from './LoansComponents.style'
import { AddCollateralPopupDataType } from './Modals/AddCollateral.modal'

type PermissionVaultsPropsType = {
  permissionVaults: Array<BorrowingData>
  lendingControllerAddress: string
}

export const PermissionVaults = ({ permissionVaults, lendingControllerAddress }: PermissionVaultsPropsType) => {
  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>Permissioned Vaults</h2>
      </GovRightContainerTitleArea>

      {permissionVaults.length ? (
        <div className="list-wrapper">
          {permissionVaults.map((item) => {
            return <BorrowingExpandCard openAddCollateral={(data: AddCollateralPopupDataType) => null} {...item} />
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
      <div className="factory-info">
        Lending Controller Address <TzAddress tzAddress={lendingControllerAddress} type={BLUE} />
      </div>
    </LoansTabStyled>
  )
}

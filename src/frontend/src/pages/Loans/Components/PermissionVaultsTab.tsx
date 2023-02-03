import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'

import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BorrowingExpandCard } from './BorrowindExpandCard'

import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansTabStyled } from './LoansComponents.style'

type PermissionVaultsPropsType = {
  permissionVaults: Array<LoansVaultType>
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
      <div className="factory-info">
        Lending Controller Address <TzAddress tzAddress={lendingControllerAddress} type={BLUE} />
      </div>
    </LoansTabStyled>
  )
}

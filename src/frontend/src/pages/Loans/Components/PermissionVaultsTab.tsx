import { useContext } from 'react'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'

import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BorrowingExpandCard } from './BorrowindExpandCard'

import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansTabStyled } from './LoansComponents.style'
import { loansPopupsContext } from './Modals/LoansModals.provider'

type PermissionVaultsPropsType = {
  permissionVaults: Array<BorrowingData>
  lendingControllerAddress: string
}

export const PermissionVaults = ({ permissionVaults, lendingControllerAddress }: PermissionVaultsPropsType) => {
  const { openAddExistingCollateralPopup } = useContext(loansPopupsContext)

  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>Permissioned Vaults</h2>
      </GovRightContainerTitleArea>

      {permissionVaults.length ? (
        <div className="list-wrapper">
          {permissionVaults.map((item) => {
            return <BorrowingExpandCard openAddCollateral={openAddExistingCollateralPopup} {...item} />
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

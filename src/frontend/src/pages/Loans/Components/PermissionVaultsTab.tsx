import { useState } from 'react'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'
import { ModalStateType } from './BorrowingTab'
import { AddCollateralPopupDataType } from './Modals/Modals.helpers'

import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BorrowingExpandCard } from './BorrowindExpandCard'
import { AddCollateral } from './Modals/AddCollateral.modal'

import { EmptyContainer } from 'app/App.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansTabStyled } from './LoansComponents.style'

type PermissionVaultsPropsType = {
  permissionVaults: Array<BorrowingData>
  lendingControllerAddress: string
}

export const PermissionVaults = ({ permissionVaults, lendingControllerAddress }: PermissionVaultsPropsType) => {
  // Add existing collateral modal data and hanlders
  const [addExistingCollateralModalInfo, setAddExistingCollateralModalInfo] = useState<
    ModalStateType<AddCollateralPopupDataType>
  >({
    showModal: false,
    data: null,
  })
  const openAddCollateral = (popupData: AddCollateralPopupDataType) =>
    setAddExistingCollateralModalInfo({
      showModal: true,
      data: popupData ? { ...popupData } : null,
    })
  const closeAddCollateralPopupHandler = () =>
    setAddExistingCollateralModalInfo({ ...addExistingCollateralModalInfo, showModal: false })

  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>Permissioned Vaults</h2>
      </GovRightContainerTitleArea>

      <AddCollateral
        closePopup={closeAddCollateralPopupHandler}
        show={addExistingCollateralModalInfo.showModal}
        data={addExistingCollateralModalInfo.data}
      />

      {permissionVaults.length ? (
        <div className="list-wrapper">
          {permissionVaults.map((item) => {
            return <BorrowingExpandCard openAddCollateral={openAddCollateral} {...item} />
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

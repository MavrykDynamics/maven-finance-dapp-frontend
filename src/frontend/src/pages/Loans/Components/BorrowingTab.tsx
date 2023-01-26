import { useState } from 'react'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { CreateNewVault } from './Modals/CreateNewVault.modal'

import { Button } from 'app/App.components/Button/Button.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BorrowingExpandCard } from './BorrowindExpandCard'

import {
  AddCollateralPopupDataType,
  RepayPartPopupDataType,
  RepayFullPopupDataType,
  BorrowPopupDataType,
  WithdrawCollateralPopupDataType,
  AddNewCollateralDataProps,
} from './Modals/Modals.helpers'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

// popups
import { AddCollateral } from './Modals/AddCollateral.modal'
import { AddNewCollateral } from './Modals/AddNewCollateral.modal'
import { BorrowAsset } from './Modals/BorrowAsset.modal'
import { ChangeBaker } from './Modals/ChangeBaker'
import { ManagePermissions } from './Modals/ManagePermissions.modal'
import { Repay } from './Modals/Repay.modal'
import { RepayFull } from './Modals/RepayFull.modal'
import { UpdateMVKOperator } from './Modals/UpdateMVKOperator.modal'
import { WithdrawCollateral } from './Modals/WithdrawCollateral.modal'

type BorrowingTabPropsType = {
  borrowingItems: Array<BorrowingData>
  lendingControllerAddress: string
  currentMarketAsset: string
}

export type ModalStateType<T = {}> = {
  showModal: boolean
  data: T
}

export const BorrowingTab = ({
  borrowingItems,
  lendingControllerAddress,
  currentMarketAsset,
}: BorrowingTabPropsType) => {
  const [showCreateVaultModal, setCreateVaultModal] = useState(false)

  // Add new collateral modal data and hanlders
  const [addNewCollateralModalInfo, setAddNewCollateralModalInfo] = useState<ModalStateType<AddNewCollateralDataProps>>(
    {
      showModal: false,
      data: null,
    },
  )
  const openAddNewCollateral = (popupData: ModalStateType<AddNewCollateralDataProps>['data']) =>
    setAddNewCollateralModalInfo({ showModal: true, data: popupData ? { ...popupData } : null })
  const closeAddNewCollateral = () => setAddNewCollateralModalInfo({ ...addNewCollateralModalInfo, showModal: false })

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

  // Add new collateral modal data and hanlders
  const [repayModalInfo, setRepayModalInfo] = useState<ModalStateType<RepayPartPopupDataType>>({
    showModal: false,
    data: null,
  })
  const openRepay = (popupData: RepayPartPopupDataType) =>
    setRepayModalInfo({ showModal: true, data: popupData ? { ...popupData } : null })
  const closeRepay = () => setRepayModalInfo({ ...repayModalInfo, showModal: false })

  // Refay and close vault modal data and hanlders
  const [repayFullModalInfo, setRepayFullModalInfo] = useState<ModalStateType<RepayFullPopupDataType>>({
    showModal: false,
    data: null,
  })
  const openRepayFull = (popupData: RepayFullPopupDataType) =>
    setRepayFullModalInfo({ showModal: true, data: popupData ? { ...popupData } : null })
  const closeRepayFull = () => setRepayFullModalInfo({ ...repayFullModalInfo, showModal: false })

  // Borrow vault asset modal data and hanlders
  const [borrowModalInfo, setBorrowModalInfo] = useState<ModalStateType<BorrowPopupDataType>>({
    showModal: false,
    data: null,
  })
  const openBorrow = (popupData: BorrowPopupDataType) =>
    setBorrowModalInfo({ showModal: true, data: popupData ? { ...popupData } : null })
  const closeBorrow = () => setBorrowModalInfo({ ...borrowModalInfo, showModal: false })

  // Withdraw collateral modal data and hanlders
  const [withdrawCollateralModalInfo, setWithdrawCollateralModalInfo] = useState<
    ModalStateType<WithdrawCollateralPopupDataType>
  >({
    showModal: false,
    data: null,
  })
  const openWithdrawCollateral = (popupData: WithdrawCollateralPopupDataType) =>
    setWithdrawCollateralModalInfo({ showModal: true, data: popupData ? { ...popupData } : null })
  const closeWithdrawCollateral = () =>
    setWithdrawCollateralModalInfo({ ...withdrawCollateralModalInfo, showModal: false })

  // Change baker modal data and hanlders
  const [changeBakerModalInfo, setChangeBakerModalInfo] = useState({
    showModal: false,
    data: {},
  })
  const openChangeBaker = () => setChangeBakerModalInfo({ ...changeBakerModalInfo, showModal: true })
  const closeChangeBaker = () => setChangeBakerModalInfo({ ...changeBakerModalInfo, showModal: false })

  // Update operators modal data and hanlders
  const [updateOperatorModalInfo, setUpdateOperatorModalInfo] = useState({
    showModal: false,
    data: {},
  })
  const openUpdateOperators = () => setUpdateOperatorModalInfo({ ...updateOperatorModalInfo, showModal: true })
  const closeUpdateOperators = () => setUpdateOperatorModalInfo({ ...updateOperatorModalInfo, showModal: false })

  // Manage permissions modal data and hanlders
  const [managePermissionsModalInfo, setManagePermissionsModalInfo] = useState({
    showModal: false,
    data: {},
  })
  const openManagePermissions = () => setManagePermissionsModalInfo({ ...managePermissionsModalInfo, showModal: true })
  const closeManagePermissions = () =>
    setManagePermissionsModalInfo({ ...managePermissionsModalInfo, showModal: false })

  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Boorrowing</h2>
      </GovRightContainerTitleArea>

      <BorrowAsset closePopup={closeBorrow} show={borrowModalInfo.showModal} data={borrowModalInfo.data} />
      <AddCollateral
        closePopup={closeAddCollateralPopupHandler}
        show={addExistingCollateralModalInfo.showModal}
        data={addExistingCollateralModalInfo.data}
      />
      <AddNewCollateral
        closePopup={closeAddNewCollateral}
        show={addNewCollateralModalInfo.showModal}
        data={addNewCollateralModalInfo.data}
      />
      <WithdrawCollateral
        closePopup={closeWithdrawCollateral}
        show={withdrawCollateralModalInfo.showModal}
        data={withdrawCollateralModalInfo.data}
      />
      <Repay closePopup={closeRepay} show={repayModalInfo.showModal} data={repayModalInfo.data} />
      <RepayFull closePopup={closeRepayFull} show={repayFullModalInfo.showModal} data={repayFullModalInfo.data} />
      <ChangeBaker closePopup={closeChangeBaker} show={changeBakerModalInfo.showModal} />
      <UpdateMVKOperator closePopup={closeUpdateOperators} show={updateOperatorModalInfo.showModal} />
      <ManagePermissions closePopup={closeManagePermissions} show={managePermissionsModalInfo.showModal} />

      <CreateNewVault
        closePopup={() => setCreateVaultModal(false)}
        show={showCreateVaultModal}
        currentMarketAsset={currentMarketAsset}
      />

      {borrowingItems.length ? (
        <>
          <Button
            text="New Vault"
            icon="plus"
            onClick={() => setCreateVaultModal(true)}
            kind={ACTION_PRIMARY}
            className="lending-tab-no-items-btn has-items-borrow-btn"
          />
          <div className="list-wrapper">
            {borrowingItems.map((item, idx) => {
              return (
                <BorrowingExpandCard
                  isOwner
                  {...item}
                  key={item.borrowedAsset.assetSymbol + '-' + idx}
                  openAddNewCollateral={openAddNewCollateral}
                  openAddCollateral={openAddCollateral}
                  openRepay={openRepay}
                  openRepayFull={openRepayFull}
                  openBorrow={openBorrow}
                  openChangeBaker={openChangeBaker}
                  openWithdrawCollateral={openWithdrawCollateral}
                  openUpdateOperators={openUpdateOperators}
                  openManagePermissions={openManagePermissions}
                />
              )
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
            onClick={() => setCreateVaultModal(true)}
            className="lending-tab-no-items-btn"
          />
        </NoItemsInTabStyled>
      )}
      <div className="factory-info">
        Lending Controller Address <TzAddress tzAddress={lendingControllerAddress} type={BLUE} />
      </div>
    </LoansTabStyled>
  )
}

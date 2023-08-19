import React, { createContext, useContext } from 'react'

import { AddCollateral } from 'pages/Loans/Components/Modals/AddCollateral.modal'
import { AddLendingAsset } from 'pages/Loans/Components/Modals/AddLendingAsset.modal'
import { AddNewCollateral } from 'pages/Loans/Components/Modals/AddNewCollateral.modal'
import { BorrowAsset } from 'pages/Loans/Components/Modals/BorrowAsset.modal'
import { ChangeBaker } from 'pages/Loans/Components/Modals/ChangeBaker.modal'
import { ChangeVaultName } from 'pages/Loans/Components/Modals/ChangeVaultName.modal'
import { ConfirmAddLendingAsset } from 'pages/Loans/Components/Modals/ConfirmAddLendingAsset.modal'
import { ConfirmBorrowAsset } from 'pages/Loans/Components/Modals/ConfirmBorrowAsset.modal'
import { ConfirmRemoveAssetsFromLending } from 'pages/Loans/Components/Modals/ConfirmRemoveAssetsFromLending.modal'
import { ConfirmRepay } from 'pages/Loans/Components/Modals/ConfirmRepay.modal'
import { ConfirmRepayFull } from 'pages/Loans/Components/Modals/ConfirmRepayFull.modal'
import { CreateNewVault } from 'pages/Loans/Components/Modals/CreateNewVault.modal'
import { ManagePermissions } from 'pages/Loans/Components/Modals/ManagePermissions.modal'
import {
  LoansPopupsContextStateType,
  DEFAULT_LOANS_POPUPS_STATE,
  ConfirmAddLendingAssetDataType,
  ConfirmRemoveLendingAssetDataType,
  ConfirmBorrowPopupDataType,
  ConfirmRepayPartPopupDataType,
  ConfirmRepayFullPopupDataType,
  ChangeBakerPopupDataType,
  BorrowPopupDataType,
  WithdrawCollateralPopupDataType,
  AddCollateralPopupDataType,
  AddNewCollateralDataProps,
  UpdateOperatorsPopupDataType,
  ManagePermissionsPopupDataType,
  ChangeVaultNamePopupDataType,
  CreateVaultPopupDataType,
  AddLendingAssetDataType,
  LiquidateVaultDataType,
} from 'providers/LoansProvider/helpers/LoansModals.types'
import { UpdateMVKOperator } from 'pages/Loans/Components/Modals/UpdateMVKOperator.modal'
import { WithdrawCollateral } from 'pages/Loans/Components/Modals/WithdrawCollateral.modal'
import { LiquidateVaultModal } from 'pages/Vaults/components/LiquidateVaultModal/LiquidateVaultModal.modal'

export const loansPopupsContext = createContext<LoansPopupsContextStateType>(undefined!)

/**
 * LoansPopupsProvider - A provider component responsible for managing the state of loan interaction popups.
 * @class
 * @augments {React.Component}
 */
export class LoansPopupsProvider extends React.Component<{ children?: React.ReactNode }, LoansPopupsContextStateType> {
  constructor(props: {}) {
    super(props)

    this.state = {
      ...DEFAULT_LOANS_POPUPS_STATE,
      openConfirmAddLendingAssetPopup: this.openConfirmAddLendingAssetPopup,
      closeConfirmAddLendingAssetPopup: this.closeConfirmAddLendingAssetPopup,

      openConfirmRemoveLendingAssetPopup: this.openConfirmRemoveLendingAssetPopup,
      closeConfirmRemoveLendingAssetPopup: this.closeConfirmRemoveLendingAssetPopup,

      openConfirmBorrowPopup: this.openConfirmBorrowPopup,
      closeConfirmBorrowPopup: this.closeConfirmBorrowPopup,

      openConfirmRepayPopup: this.openConfirmRepayPopup,
      closeConfirmRepayPopup: this.closeConfirmRepayPopup,

      openConfirmRepayFullPopup: this.openConfirmRepayFullPopup,
      closeConfirmRepayFullPopup: this.closeConfirmRepayFullPopup,

      openChangeBakerPopup: this.openChangeBakerPopup,
      closeChangeBakerPopup: this.closeChangeBakerPopup,

      openAddExistingCollateralPopup: this.openAddExistingCollateralPopup,
      closeAddExistingCollateralPopup: this.closeAddExistingCollateralPopup,

      openAddNewCollateralPopup: this.openAddNewCollateralPopup,
      closeAddNewCollateralPopup: this.closeAddNewCollateralPopup,

      openBorrowPopup: this.openBorrowPopup,
      closeBorrowPopup: this.closeBorrowPopup,

      openManagePermissionsPopup: this.openManagePermissionsPopup,
      closeManagePermissionsPopup: this.closeManagePermissionsPopup,

      openUpdateMvkOperatorsPopup: this.openUpdateMvkOperatorsPopup,
      closeUpdateMvkOperatorsPopup: this.closeUpdateMvkOperatorsPopup,

      openWithdrawCollateralPopup: this.openWithdrawCollateralPopup,
      closeWithdrawCollateralPopup: this.closeWithdrawCollateralPopup,

      openChangeVaultNamePopup: this.openChangeVaultNamePopup,
      closeChangeVaultNamePopup: this.closeChangeVaultNamePopup,

      openCreateVaultPopup: this.openCreateVaultPopup,
      closeCreateVaultPopup: this.closeCreateVaultPopup,

      openAddLendingAssetPopup: this.openAddLendingAssetPopup,
      closeAddLendingAssetPopup: this.closeAddLendingAssetPopup,

      openLiquidateVaultPopup: this.openLiquidateVaultPopup,
      closeLiquidateVaultPopup: this.closeLiquidateVaultPopup,
    }
  }

  openConfirmAddLendingAssetPopup = (popupData: ConfirmAddLendingAssetDataType) => {
    this.setState({
      ...this.state,
      confirmAddLendingAssetPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeConfirmAddLendingAssetPopup = () => {
    this.setState({
      ...this.state,
      confirmAddLendingAssetPopup: {
        ...this.state.confirmAddLendingAssetPopup,
        showModal: false,
      },
    })
  }

  openConfirmRemoveLendingAssetPopup = (popupData: ConfirmRemoveLendingAssetDataType) => {
    this.setState({
      ...this.state,
      confirmRemoveLendingAssetPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeConfirmRemoveLendingAssetPopup = () => {
    this.setState({
      ...this.state,
      confirmRemoveLendingAssetPopup: {
        ...this.state.confirmRemoveLendingAssetPopup,
        showModal: false,
      },
    })
  }

  openConfirmBorrowPopup = (popupData: ConfirmBorrowPopupDataType) => {
    this.setState({
      ...this.state,
      confirmBorrowAssetPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeConfirmBorrowPopup = () => {
    this.setState({
      ...this.state,
      confirmBorrowAssetPopup: {
        ...this.state.confirmBorrowAssetPopup,
        showModal: false,
      },
    })
  }

  openConfirmRepayPopup = (popupData: ConfirmRepayPartPopupDataType) => {
    this.setState({
      ...this.state,
      confirmRepayPartPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeConfirmRepayPopup = () => {
    this.setState({
      ...this.state,
      confirmRepayPartPopup: {
        ...this.state.confirmRepayPartPopup,
        showModal: false,
      },
    })
  }

  openConfirmRepayFullPopup = (popupData: ConfirmRepayFullPopupDataType) => {
    this.setState({
      ...this.state,
      confirmRepayFullPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeConfirmRepayFullPopup = () => {
    this.setState({
      ...this.state,
      confirmRepayFullPopup: {
        ...this.state.confirmRepayFullPopup,
        showModal: false,
      },
    })
  }

  openChangeBakerPopup = (popupData: ChangeBakerPopupDataType) => {
    this.setState({
      ...this.state,
      changeBakerPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeChangeBakerPopup = () => {
    this.setState({
      ...this.state,
      changeBakerPopup: {
        ...this.state.changeBakerPopup,
        showModal: false,
      },
    })
  }

  openBorrowPopup = (popupData: BorrowPopupDataType) => {
    this.setState({
      ...this.state,
      borrowAssetPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeBorrowPopup = () => {
    this.setState({
      ...this.state,
      borrowAssetPopup: {
        ...this.state.borrowAssetPopup,
        showModal: false,
      },
    })
  }

  openWithdrawCollateralPopup = (popupData: WithdrawCollateralPopupDataType) => {
    this.setState({
      ...this.state,
      withdrawCollateralPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeWithdrawCollateralPopup = () => {
    this.setState({
      ...this.state,
      withdrawCollateralPopup: {
        ...this.state.withdrawCollateralPopup,
        showModal: false,
      },
    })
  }

  openAddExistingCollateralPopup = (popupData: AddCollateralPopupDataType) => {
    this.setState({
      ...this.state,
      addExistingCollateralPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeAddExistingCollateralPopup = () => {
    this.setState({
      ...this.state,
      addExistingCollateralPopup: {
        ...this.state.addExistingCollateralPopup,
        showModal: false,
      },
    })
  }

  openAddNewCollateralPopup = (popupData: AddNewCollateralDataProps) => {
    this.setState({
      ...this.state,
      addNewCollateralPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeAddNewCollateralPopup = () => {
    this.setState({
      ...this.state,
      addNewCollateralPopup: {
        ...this.state.addNewCollateralPopup,
        showModal: false,
      },
    })
  }

  openUpdateMvkOperatorsPopup = (popupData: UpdateOperatorsPopupDataType) => {
    this.setState({
      ...this.state,
      updateMvkOperatorPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeUpdateMvkOperatorsPopup = () => {
    this.setState({
      ...this.state,
      updateMvkOperatorPopup: {
        ...this.state.updateMvkOperatorPopup,
        showModal: false,
      },
    })
  }

  openManagePermissionsPopup = (popupData: ManagePermissionsPopupDataType) => {
    this.setState({
      ...this.state,
      managePermissionsPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeManagePermissionsPopup = () => {
    this.setState({
      ...this.state,
      managePermissionsPopup: {
        ...this.state.managePermissionsPopup,
        showModal: false,
      },
    })
  }

  openChangeVaultNamePopup = (popupData: ChangeVaultNamePopupDataType) => {
    this.setState({
      ...this.state,
      changeVaultNamePopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeChangeVaultNamePopup = () => {
    this.setState({
      ...this.state,
      changeVaultNamePopup: {
        ...this.state.changeVaultNamePopup,
        showModal: false,
      },
    })
  }

  openCreateVaultPopup = (popupData: CreateVaultPopupDataType) => {
    this.setState({
      ...this.state,
      createVaultPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeCreateVaultPopup = () => {
    this.setState({
      ...this.state,
      createVaultPopup: {
        ...this.state.createVaultPopup,
        showModal: false,
      },
    })
  }

  openAddLendingAssetPopup = (popupData: AddLendingAssetDataType) => {
    this.setState({
      ...this.state,
      addLendingAssetPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeAddLendingAssetPopup = () => {
    this.setState({
      ...this.state,
      addLendingAssetPopup: {
        ...this.state.addLendingAssetPopup,
        showModal: false,
      },
    })
  }

  openLiquidateVaultPopup = (popupData: LiquidateVaultDataType) => {
    this.setState({
      ...this.state,
      liquidateVaultPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeLiquidateVaultPopup = () => {
    this.setState({
      ...this.state,
      liquidateVaultPopup: {
        ...this.state.liquidateVaultPopup,
        showModal: false,
      },
    })
  }

  /**
   *
   * Render method of LoansPopupsProvider component.
   * @returns {object} A JSX element wrapping all popups and child components within the context provider.
   */
  render() {
    const {
      confirmAddLendingAssetPopup,
      confirmRemoveLendingAssetPopup,
      confirmRepayPartPopup,
      confirmRepayFullPopup,
      confirmBorrowAssetPopup,
      changeBakerPopup,
      borrowAssetPopup,
      addExistingCollateralPopup,
      addNewCollateralPopup,
      managePermissionsPopup,
      updateMvkOperatorPopup,
      withdrawCollateralPopup,
      changeVaultNamePopup,
      createVaultPopup,
      addLendingAssetPopup,
      liquidateVaultPopup,
    } = this.state

    const {
      closeConfirmAddLendingAssetPopup,
      closeConfirmRemoveLendingAssetPopup,
      closeConfirmBorrowPopup,
      closeConfirmRepayPopup,
      closeConfirmRepayFullPopup,
      closeChangeBakerPopup,
      closeAddExistingCollateralPopup,
      closeAddNewCollateralPopup,
      closeBorrowPopup,
      closeWithdrawCollateralPopup,
      closeManagePermissionsPopup,
      closeUpdateMvkOperatorsPopup,
      closeChangeVaultNamePopup,
      closeCreateVaultPopup,
      closeAddLendingAssetPopup,
      closeLiquidateVaultPopup,
    } = this.state
    return (
      <loansPopupsContext.Provider value={this.state}>
        <ConfirmAddLendingAsset
          closePopup={closeConfirmAddLendingAssetPopup}
          show={confirmAddLendingAssetPopup.showModal}
          data={confirmAddLendingAssetPopup.data}
        />

        <ConfirmRemoveAssetsFromLending
          closePopup={closeConfirmRemoveLendingAssetPopup}
          show={confirmRemoveLendingAssetPopup.showModal}
          data={confirmRemoveLendingAssetPopup.data}
        />

        <ConfirmBorrowAsset
          closePopup={closeConfirmBorrowPopup}
          show={confirmBorrowAssetPopup.showModal}
          data={confirmBorrowAssetPopup.data}
        />

        <ConfirmRepay
          closePopup={closeConfirmRepayPopup}
          show={confirmRepayPartPopup.showModal}
          data={confirmRepayPartPopup.data}
        />

        <ConfirmRepayFull
          closePopup={closeConfirmRepayFullPopup}
          show={confirmRepayFullPopup.showModal}
          data={confirmRepayFullPopup.data}
        />

        <ChangeBaker
          closePopup={closeChangeBakerPopup}
          show={changeBakerPopup.showModal}
          data={changeBakerPopup.data}
        />

        <BorrowAsset closePopup={closeBorrowPopup} show={borrowAssetPopup.showModal} data={borrowAssetPopup.data} />

        <AddCollateral
          closePopup={closeAddExistingCollateralPopup}
          show={addExistingCollateralPopup.showModal}
          data={addExistingCollateralPopup.data}
        />
        <AddNewCollateral
          closePopup={closeAddNewCollateralPopup}
          show={addNewCollateralPopup.showModal}
          data={addNewCollateralPopup.data}
        />
        <WithdrawCollateral
          closePopup={closeWithdrawCollateralPopup}
          show={withdrawCollateralPopup.showModal}
          data={withdrawCollateralPopup.data}
        />

        <UpdateMVKOperator
          closePopup={closeUpdateMvkOperatorsPopup}
          show={updateMvkOperatorPopup.showModal}
          data={updateMvkOperatorPopup.data}
        />
        <ManagePermissions
          closePopup={closeManagePermissionsPopup}
          show={managePermissionsPopup.showModal}
          data={managePermissionsPopup.data}
        />

        <ChangeVaultName
          closePopup={closeChangeVaultNamePopup}
          show={changeVaultNamePopup.showModal}
          data={changeVaultNamePopup.data}
        />

        <CreateNewVault
          closePopup={closeCreateVaultPopup}
          show={createVaultPopup.showModal}
          data={createVaultPopup.data}
        />

        <AddLendingAsset
          closePopup={closeAddLendingAssetPopup}
          show={addLendingAssetPopup.showModal}
          data={addLendingAssetPopup.data}
        />

        <LiquidateVaultModal
          closePopup={closeLiquidateVaultPopup}
          show={liquidateVaultPopup.showModal}
          data={liquidateVaultPopup.data}
        />

        {this.props.children}
      </loansPopupsContext.Provider>
    )
  }
}

export const useLoansPopupsContext = () => {
  const context = useContext(loansPopupsContext)

  if (!context) {
    throw new Error('loansPopupsContext should be used withing LoansPopupsProvider provider')
  }

  return context
}

export default LoansPopupsProvider

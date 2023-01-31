import React from 'react'
import { createContext } from 'react'
import { AddCollateral } from './AddCollateral.modal'
import { AddLendingAsset } from './AddLendingAsset.modal'
import { AddNewCollateral } from './AddNewCollateral.modal'
import { BorrowAsset } from './BorrowAsset.modal'
import { ChangeBaker } from './ChangeBaker'
import { CreateNewVault } from './CreateNewVault.modal'
import { ManagePermissions } from './ManagePermissions.modal'
import {
  AddCollateralPopupDataType,
  AddLendingAssetDataType,
  AddNewCollateralDataProps,
  BorrowPopupDataType,
  ChangeBakerPopupDataType,
  CreateVaultPopupDataType,
  DEFAULT_LOANS_POPUPS_STATE,
  LoansPopupsContextStateType,
  ManagePermissionsPopupDataType,
  RemoveLendingAssetDataType,
  RepayFullPopupDataType,
  RepayPartPopupDataType,
  UpdateOperatorsPopupDataType,
  WithdrawCollateralPopupDataType,
  LiquidateVaultDataType,
} from './Modals.helpers'
import { RemoveAssetsFromLending } from './RemoveAssetsFromLending.modal'
import { Repay } from './Repay.modal'
import { RepayFull } from './RepayFull.modal'
import { UpdateMVKOperator } from './UpdateMVKOperator.modal'
import { WithdrawCollateral } from './WithdrawCollateral.modal'
import { LiquidateVaultModal } from 'pages/Vaults/components/LiquidateVaultModal/LiquidateVaultModal.modal'

export const loansPopupsContext = createContext<LoansPopupsContextStateType>(undefined!)

export default class LoansPopupsProvider extends React.Component<{}, LoansPopupsContextStateType> {
  constructor(props: {}) {
    super(props)

    this.state = {
      ...DEFAULT_LOANS_POPUPS_STATE,
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

      openRepayFullPopup: this.openRepayFullPopup,
      closeRepayFullPopup: this.closeRepayFullPopup,

      openRepayPopup: this.openRepayPopup,
      closeRepayPopup: this.closeRepayPopup,

      openUpdateMvkOperatorsPopup: this.openUpdateMvkOperatorsPopup,
      closeUpdateMvkOperatorsPopup: this.closeUpdateMvkOperatorsPopup,

      openWithdrawCollateralPopup: this.openWithdrawCollateralPopup,
      closeWithdrawCollateralPopup: this.closeWithdrawCollateralPopup,

      openCreateVaultPopup: this.openCreateVaultPopup,
      closeCreateVaultPopup: this.closeCreateVaultPopup,

      openAddLendingAssetPopup: this.openAddLendingAssetPopup,
      closeAddLendingAssetPopup: this.closeAddLendingAssetPopup,

      openRemoveLendingAssetPopup: this.openRemoveLendingAssetPopup,
      closeRemoveLendingAssetPopup: this.closeRemoveLendingAssetPopup,

      openLiquidateVaultPopup: this.openLiquidateVaultPopup,
      closeLiquidateVaultPopup: this.closeLiquidateVaultPopup,
    }
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

  openRepayPopup = (popupData: RepayPartPopupDataType) => {
    this.setState({
      ...this.state,
      repayPartPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeRepayPopup = () => {
    this.setState({
      ...this.state,
      repayPartPopup: {
        ...this.state.repayPartPopup,
        showModal: false,
      },
    })
  }

  openRepayFullPopup = (popupData: RepayFullPopupDataType) => {
    this.setState({
      ...this.state,
      repayFullPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeRepayFullPopup = () => {
    this.setState({
      ...this.state,
      repayFullPopup: {
        ...this.state.repayFullPopup,
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

  openRemoveLendingAssetPopup = (popupData: RemoveLendingAssetDataType) => {
    this.setState({
      ...this.state,
      removeLendingAssetPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeRemoveLendingAssetPopup = () => {
    this.setState({
      ...this.state,
      removeLendingAssetPopup: {
        ...this.state.removeLendingAssetPopup,
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

  render() {
    const {
      changeBakerPopup,
      repayPartPopup,
      repayFullPopup,
      borrowAssetPopup,
      addExistingCollateralPopup,
      addNewCollateralPopup,
      managePermissionsPopup,
      updateMvkOperatorPopup,
      withdrawCollateralPopup,
      createVaultPopup,
      addLendingAssetPopup,
      removeLendingAssetPopup,
      liquidateVaultPopup,
    } = this.state

    const {
      closeChangeBakerPopup,
      closeAddExistingCollateralPopup,
      closeAddNewCollateralPopup,
      closeBorrowPopup,
      closeRepayFullPopup,
      closeRepayPopup,
      closeWithdrawCollateralPopup,
      closeManagePermissionsPopup,
      closeUpdateMvkOperatorsPopup,
      closeCreateVaultPopup,
      closeAddLendingAssetPopup,
      closeRemoveLendingAssetPopup,
      closeLiquidateVaultPopup,
    } = this.state
    return (
      <loansPopupsContext.Provider value={this.state}>
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

        <Repay closePopup={closeRepayPopup} show={repayPartPopup.showModal} data={repayPartPopup.data} />
        <RepayFull closePopup={closeRepayFullPopup} show={repayFullPopup.showModal} data={repayFullPopup.data} />

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

        <RemoveAssetsFromLending
          closePopup={closeRemoveLendingAssetPopup}
          show={removeLendingAssetPopup.showModal}
          data={removeLendingAssetPopup.data}
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

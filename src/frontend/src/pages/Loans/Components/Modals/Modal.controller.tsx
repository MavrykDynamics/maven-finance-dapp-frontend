import { PopupContainer } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import {
  UPDATE_MVK_OPERATORS_MODAL_ID,
  MANAGE_PERMISSIONS_MODAL_ID,
  ADD_COLLATERAL_MODAL_ID,
  REMOVE_COLLATERAL_MODAL_ID,
  BORROW_ASSET_MODAL_ID,
  REPAY_MODAL_ID,
  CLOSE_VAULT_MODAL_ID,
} from 'pages/Loans/Loans.const'

import { ModalTypes } from 'utils/TypesAndInterfaces/Loans'
import { AddCollateral } from './AddCollateral.modal'
import { BorrowAsset } from './BorrowAsset.modal'
import { CloseVault } from './CloseVault.modal'
import { ManagePermissions } from './ManagePermissions.modal'
import { RemoveCollateral } from './RemoveCollateral.modal'
import { Repay } from './Repay.modal'

import { UpdateMVKOperator } from './UpdateMVKOperator.modal'

type LoansModalsPropsType = {
  activeModal: ModalTypes
  closePopup: () => void
}

export const LoansModals = ({ activeModal, closePopup }: LoansModalsPropsType) => {
  return (
    <PopupContainer onClick={closePopup} show={activeModal !== null}>
      {activeModal === CLOSE_VAULT_MODAL_ID ? <CloseVault closePopup={closePopup} /> : null}
      {activeModal === REPAY_MODAL_ID ? <Repay closePopup={closePopup} /> : null}
      {activeModal === BORROW_ASSET_MODAL_ID ? <BorrowAsset closePopup={closePopup} /> : null}
      {activeModal === REMOVE_COLLATERAL_MODAL_ID ? <RemoveCollateral closePopup={closePopup} /> : null}
      {activeModal === ADD_COLLATERAL_MODAL_ID ? <AddCollateral closePopup={closePopup} /> : null}
      {activeModal === MANAGE_PERMISSIONS_MODAL_ID ? <ManagePermissions closePopup={closePopup} /> : null}
      {activeModal === UPDATE_MVK_OPERATORS_MODAL_ID ? <UpdateMVKOperator closePopup={closePopup} /> : null}
    </PopupContainer>
  )
}

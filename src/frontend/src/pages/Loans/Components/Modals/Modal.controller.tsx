import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import {
  ADD_COLLATERAL_MODAL_ID,
  ADD_LENDING_ASSET_MODAL_ID,
  BORROW_ASSET_MODAL_ID,
  CHANGE_BAKER_MODAL_ID,
  CREATE_NEW_VAULT_MODAL_ID,
  MANAGE_PERMISSIONS_MODAL_ID,
  REMOVE_ASSET_LENDING_MODAL_ID,
  WITHDRAW_COLLATERAL_MODAL_ID,
  UPDATE_MVK_OPERATORS_MODAL_ID,
  REPAY_AND_CLOSE_MODAL_ID,
  ADD_NEW_COLLATERAL_MODAL_ID,
  REPAY_MODAL_ID,
} from 'pages/Loans/Loans.const'

import { CreateNewVault } from './CreateNewVault.modal'
import { BorrowAsset } from './BorrowAsset.modal'
import { RepayAndCloseVault } from './RepayAndCloseVault.modal'
import { ManagePermissions } from './ManagePermissions.modal'
import { Repay } from './Repay.modal'

import { UpdateMVKOperator } from './UpdateMVKOperator.modal'
import { WithdrawCollateral } from './WithdrawCollateral.modal'
import { AddCollateral } from './AddCollateral.modal'
import { AddLendingAsset } from './AddLendingAsset.modal'
import { ChangeBaker } from './ChangeBaker'
import { RemoveAssetsFromLending } from './RemoveAssetsFromLending.modal'
import { useDispatch, useSelector } from 'react-redux'
import { toggleLoansModal } from 'pages/Loans/Loans.actions'
import { State } from 'reducers'
import { AddNewCollateral } from './AddNewCollateral.modal'

export const LoansModals = () => {
  const dispatch = useDispatch()
  const { currentModalActive } = useSelector((state: State) => state.loans)
  const closePopup = () => {
    console.log('click on close modal loans')
    dispatch(toggleLoansModal(null))
  }

  return (
    <PopupContainer onClick={closePopup} show={currentModalActive !== null}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        {currentModalActive === ADD_NEW_COLLATERAL_MODAL_ID ? <AddNewCollateral closePopup={closePopup} /> : null}
        {currentModalActive === REPAY_MODAL_ID ? <Repay closePopup={closePopup} /> : null}
        {currentModalActive === BORROW_ASSET_MODAL_ID ? <BorrowAsset closePopup={closePopup} /> : null}
        {currentModalActive === WITHDRAW_COLLATERAL_MODAL_ID ? <WithdrawCollateral closePopup={closePopup} /> : null}
        {currentModalActive === CREATE_NEW_VAULT_MODAL_ID ? <CreateNewVault closePopup={closePopup} /> : null}
        {currentModalActive === ADD_COLLATERAL_MODAL_ID ? <AddCollateral closePopup={closePopup} /> : null}
        {currentModalActive === ADD_LENDING_ASSET_MODAL_ID ? <AddLendingAsset closePopup={closePopup} /> : null}
        {currentModalActive === REMOVE_ASSET_LENDING_MODAL_ID ? (
          <RemoveAssetsFromLending closePopup={closePopup} />
        ) : null}
        {currentModalActive === CHANGE_BAKER_MODAL_ID ? <ChangeBaker closePopup={closePopup} /> : null}
        {currentModalActive === UPDATE_MVK_OPERATORS_MODAL_ID ? <UpdateMVKOperator closePopup={closePopup} /> : null}
        {currentModalActive === MANAGE_PERMISSIONS_MODAL_ID ? <ManagePermissions closePopup={closePopup} /> : null}
        {currentModalActive === REPAY_AND_CLOSE_MODAL_ID ? <RepayAndCloseVault closePopup={closePopup} /> : null}
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

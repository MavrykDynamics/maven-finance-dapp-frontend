import { useCallback, useState } from 'react'

import {
  ADD_COLLATERAL_MODAL_ID,
  ADD_NEW_COLLATERAL_MODAL_ID,
  BORROW_ASSET_MODAL_ID,
  CHANGE_BAKER_MODAL_ID,
  COLLATERAL_RATIO_GRADIENT,
  MANAGE_PERMISSIONS_MODAL_ID,
  REPAY_AND_CLOSE_MODAL_ID,
  REPAY_MODAL_ID,
  UPDATE_MVK_OPERATORS_MODAL_ID,
  WITHDRAW_COLLATERAL_MODAL_ID,
} from '../Loans.const'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { ACTION_PRIMARY, ACTION_SIMPLE, TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BorrowingData } from 'utils/TypesAndInterfaces/Loans'
import Expand from 'app/App.components/Expand/Expand.view'
import NewButton from 'app/App.components/Button/NewButton.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from 'app/App.components/Table/Table.style'
import { ThreeLevelListItem } from '../Loans.style'
import { BorrowingTabListItemExpanded } from './LoansComponents.style'

// popups
import { BorrowAsset } from './Modals/BorrowAsset.modal'
import { AddCollateral } from './Modals/AddCollateral.modal'
import { AddNewCollateral } from './Modals/AddNewCollateral.modal'
import { WithdrawCollateral } from './Modals/WithdrawCollateral.modal'
import { ChangeBaker } from './Modals/ChangeBaker'
import { UpdateMVKOperator } from './Modals/UpdateMVKOperator.modal'
import { ManagePermissions } from './Modals/ManagePermissions.modal'
import { RepayAndCloseVault } from './Modals/RepayAndCloseVault.modal'
import { Repay } from './Modals/Repay.modal'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

type BorrowingExpandCardPropsType = {
  isOwner?: boolean
} & BorrowingData

export const BorrowingExpandCard = ({
  isOwner = false,
  borrowedAsset,
  collateralData,
  xtzDelegatedTo,
  operators,
  sMVKDelegatedTo,
  depositors,
  address,
}: BorrowingExpandCardPropsType) => {
  // Add new collateral modal data and hanlders
  const [addNewCollateralModalInfo, setAddNewCollateralModalInfo] = useState({
    showModal: false,
    data: {
      vaultAddress: address,
      currentCollateralValue: collateralData.at(-1)?.balance ?? 0,
      currentAvaliableToWithdraw: 0,
    },
  })
  const openAddNewCollateral = () => setAddNewCollateralModalInfo({ ...addNewCollateralModalInfo, showModal: true })
  const closeAddNewCollateral = () => setAddNewCollateralModalInfo({ ...addNewCollateralModalInfo, showModal: false })

  // Add new collateral modal data and hanlders
  const [repayModalInfo, setRepayModalInfo] = useState({
    showModal: false,
    data: {
      vaultAddress: address,
    },
  })
  const openRepay = () => setRepayModalInfo({ ...repayModalInfo, showModal: true })
  const closeRepay = () => setRepayModalInfo({ ...repayModalInfo, showModal: false })

  // Add new collateral modal data and hanlders
  const [repayFullModalInfo, setRepayFullModalInfo] = useState({
    showModal: false,
    data: {
      vaultAddress: address,
    },
  })
  const openRepayFull = () => setRepayFullModalInfo({ ...repayModalInfo, showModal: true })
  const closeRepayFull = () => setRepayFullModalInfo({ ...repayModalInfo, showModal: false })

  // Add new collateral modal data and hanlders
  const [borrowModalInfo, setBorrowModalInfo] = useState({
    showModal: false,
    data: {
      vaultAddress: address,
    },
  })
  const openBorrow = () => setBorrowModalInfo({ ...repayModalInfo, showModal: true })
  const closeBorrow = () => setBorrowModalInfo({ ...repayModalInfo, showModal: false })

  // Add new collateral modal data and hanlders
  const [removeCollateralModalInfo, setRemoveCollateralModalInfo] = useState({
    showModal: false,
    data: {
      vaultAddress: address,
    },
  })
  const openRemoveCollateral = () => setRemoveCollateralModalInfo({ ...repayModalInfo, showModal: true })
  const closeRemoveCollateral = () => setRemoveCollateralModalInfo({ ...repayModalInfo, showModal: false })

  // Add new collateral modal data and hanlders
  const [changeBakerModalInfo, setChangeBakerModalInfo] = useState({
    showModal: false,
    data: {
      vaultAddress: address,
    },
  })
  const openChangeBaker = () => setChangeBakerModalInfo({ ...repayModalInfo, showModal: true })
  const closeChangeBaker = () => setChangeBakerModalInfo({ ...repayModalInfo, showModal: false })

  // Add new collateral modal data and hanlders
  const [updateOperatorModalInfo, setUpdateOperatorModalInfo] = useState({
    showModal: false,
    data: {
      vaultAddress: address,
    },
  })
  const openUpdateOperators = () => setUpdateOperatorModalInfo({ ...repayModalInfo, showModal: true })
  const closeUpdateOperators = () => setUpdateOperatorModalInfo({ ...repayModalInfo, showModal: false })

  // Add new collateral modal data and hanlders
  const [managePermissionsModalInfo, setManagePermissionsModalInfo] = useState({
    showModal: false,
    data: {
      vaultAddress: address,
    },
  })
  const openManagePermissions = () => setManagePermissionsModalInfo({ ...repayModalInfo, showModal: true })
  const closeManagePermissions = () => setManagePermissionsModalInfo({ ...repayModalInfo, showModal: false })

  // Add existing collateral modal data and hanlders
  const [addExistingCollateralModalInfo, setAddExistingCollateralModalInfo] = useState({
    showModal: false,
    data: {
      vaultAddress: address,
      currentCollateralValue: collateralData.at(-1)?.balance ?? 0,
      currentAvaliableToWithdraw: 0,
      selectedAsset: collateralData?.[0],
    },
  })
  const addCollateralHandler = (idx: number) =>
    setAddExistingCollateralModalInfo({
      showModal: true,
      data: { ...addExistingCollateralModalInfo.data, selectedAsset: collateralData[idx] },
    })
  const closeAddCollateralPopupHandler = () =>
    setAddExistingCollateralModalInfo({ ...addExistingCollateralModalInfo, showModal: false })

  const {
    assetSymbol,
    assetIcon,
    amtBorrowed = 0,
    assetRate = 1,
    collateralBalance = 0,
    collateralUtilization = 0,
    apr,
    fee = 0,
  } = borrowedAsset

  const mappedDepositors = {
    isAll: depositors?.[0] === 'all',
    isNone: depositors?.[0] === 'none',
    firstAddress: depositors?.[0],
    ...(depositors ? { amount: depositors.length - 1 } : {}),
  }
  const mappedMVKOperators = {
    firstAddress: operators?.[0],
    ...(operators ? { amount: operators.length - 1 } : {}),
  }

  return (
    <>
      <BorrowAsset closePopup={closeBorrow} show={borrowModalInfo.showModal} />
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
      <WithdrawCollateral closePopup={closeRemoveCollateral} show={removeCollateralModalInfo.showModal} />
      <ChangeBaker closePopup={closeChangeBaker} show={changeBakerModalInfo.showModal} />
      <UpdateMVKOperator closePopup={closeUpdateOperators} show={updateOperatorModalInfo.showModal} />
      <ManagePermissions closePopup={closeManagePermissions} show={managePermissionsModalInfo.showModal} />
      <RepayAndCloseVault closePopup={closeRepayFull} show={repayFullModalInfo.showModal} />
      <Repay closePopup={closeRepay} show={repayModalInfo.showModal} />

      <Expand
        className="expand-borrow-tab"
        header={
          <>
            <ThreeLevelListItem className="borrow-asset-header">
              {assetIcon ? (
                <div className="img-wrapper">
                  <img src={assetIcon} alt={`${assetSymbol} logo`} />
                </div>
              ) : (
                <Icon id="noImage" />
              )}
              <div className="data">
                <div className="value">{assetSymbol}</div>
                <div className="value">
                  <TzAddress tzAddress={address} shouldCopy hasIcon amountFromStart={4} amountFromEnd={4} />
                </div>
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem className="collateral-diagram">
              <div className={`percentage ${Number(collateralUtilization) / 100 > 2.5 ? 'up' : 'down'}`}>
                Collateral Ratio: <CommaNumber value={collateralUtilization} endingText="%" />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={50}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Amount</div>
              <CommaNumber value={amtBorrowed} className="value" />
              {assetRate ? <CommaNumber value={amtBorrowed * assetRate} beginningText="$" className="rate" /> : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral Balance</div>
              <CommaNumber value={collateralBalance} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </>
        }
      >
        <BorrowingTabListItemExpanded>
          <div className="block-name">Borrowed</div>
          <div className="borrowed-data">
            <ThreeLevelListItem>
              <div className="name">Asset</div>
              <div className="value">
                {assetIcon ? (
                  <div className="img-wrapper">
                    <img src={assetIcon} alt={`${assetSymbol} logo`} />
                  </div>
                ) : (
                  <div className="no-icon">
                    <Icon id="noImage" />
                  </div>
                )}
                {assetSymbol}
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Amount</div>
              <CommaNumber value={amtBorrowed} className="value" />
              {assetRate ? <CommaNumber value={amtBorrowed * assetRate} beginningText="$" className="rate" /> : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Fee</div>
              <CommaNumber value={fee} className="value" />
              {assetRate ? <CommaNumber value={fee * assetRate} beginningText="$" className="rate" /> : null}
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">APR</div>
              <CommaNumber value={apr} className="value" endingText="%" />
            </ThreeLevelListItem>
            {isOwner ? (
              <div className="buttons-wrapper">
                <Button text="Borrow" icon="coin-loan" strokeWidth={0.5} onClick={openBorrow} kind={ACTION_PRIMARY} />
                <NewButton onClick={openRepay} kind={TRANSPARENT_WITH_BORDER} className="repay">
                  <Icon id="okIcon" /> Repay
                </NewButton>
              </div>
            ) : null}
          </div>

          <div className="block-name margin-top">Collateral In Vault</div>
          <Table className={`no-margin borrowing-table ${isOwner ? 'show-before' : ''}`}>
            <TableHeader className={`simple-header collateral ${collateralData.length === 0 ? 'empty' : ''}`}>
              <TableRow>
                <TableHeaderCell>Asset</TableHeaderCell>
                <TableHeaderCell>Balance</TableHeaderCell>
                <TableHeaderCell>Withdraw Max</TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {collateralData.map(({ assetSymbol, assetIcon, balance, assetRate = 1, maxWithdraw }, idx) => {
                const isTotalRow = collateralData.length - 1 === idx
                if (isTotalRow && collateralData.length < 3) return null

                return (
                  <TableRow rowHeight={60} key={assetSymbol + '-' + idx}>
                    <TableCell width={`22%`} className="vert-middle">
                      {isTotalRow ? (
                        'Total'
                      ) : (
                        <div className="cell-content row">
                          {assetIcon ? (
                            <div className="img-wrapper">
                              <img src={assetIcon} alt={`${assetSymbol} logo`} />
                            </div>
                          ) : (
                            <div className="no-icon">
                              <Icon id="noImage" />
                            </div>
                          )}
                          {assetSymbol}
                        </div>
                      )}
                    </TableCell>
                    <TableCell width={`22%`}>
                      <div className="cell-content">
                        <CommaNumber value={balance} className="value" />
                        {assetRate ? (
                          <CommaNumber value={balance * assetRate} className="rate" beginningText="$" />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell width={`22%`}>
                      <div className="cell-content">
                        <CommaNumber value={maxWithdraw} className="value" />
                        {assetRate ? (
                          <CommaNumber value={maxWithdraw * assetRate} className="rate" beginningText="$" />
                        ) : null}
                      </div>
                    </TableCell>
                    {isTotalRow ? (
                      <TableCell className="buttons borrowing">
                        <div className="cell-content row">
                          {isOwner ? (
                            <Button
                              text="Add Collateral"
                              icon="plus"
                              strokeWidth={0.1}
                              onClick={openAddNewCollateral}
                              kind={ACTION_PRIMARY}
                              className="add-collateral"
                            />
                          ) : null}
                        </div>
                      </TableCell>
                    ) : (
                      <TableCell className="buttons borrowing">
                        <div className="cell-content row">
                          <NewButton onClick={() => addCollateralHandler(idx)} kind={TRANSPARENT_WITH_BORDER}>
                            <Icon id="plus" /> Add
                          </NewButton>
                          {isOwner ? (
                            <NewButton onClick={openRemoveCollateral} kind={TRANSPARENT_WITH_BORDER}>
                              <Icon id="minus" /> Remove
                            </NewButton>
                          ) : null}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {collateralData.length < 3 && isOwner ? (
            <Button
              text="Add Collateral"
              icon="plus"
              strokeWidth={0.1}
              onClick={openAddNewCollateral}
              kind={ACTION_PRIMARY}
              className="add-collateral"
            />
          ) : null}

          {isOwner ? (
            <>
              <div className="block-name margin-top">Delegations</div>
              <div className="bottom-info-row">
                <div className="name">XTZ Delegated to </div>
                <div className="value">
                  {xtzDelegatedTo ? <TzAddress tzAddress={xtzDelegatedTo} type={BLUE} /> : 'None'}
                </div>
                <Button
                  kind={ACTION_SIMPLE}
                  text="Change Baker"
                  icon="paginationArrowLeft"
                  iconAfter
                  onClick={openChangeBaker}
                />
              </div>
              <div className="bottom-info-row">
                <div className="name">sMVK Delegated to </div>
                <div className="value">
                  {sMVKDelegatedTo ? <TzAddress tzAddress={sMVKDelegatedTo} type={BLUE} /> : 'None'}
                </div>
                <Button kind={ACTION_SIMPLE} text="View Satellite" icon="paginationArrowLeft" iconAfter />
              </div>

              <div className="block-name margin-top-20">Permissions</div>
              <div className="bottom-info-row">
                <div className="name">Depositors </div>
                <div className="value">
                  {mappedDepositors.isAll ? 'All Alowed' : null}
                  {mappedDepositors.firstAddress
                    ? <TzAddress tzAddress={mappedDepositors.firstAddress} type={BLUE} /> +
                      ` ${mappedDepositors.amount ?? ''}`
                    : 'None Allowed'}
                </div>
                <Button
                  kind={ACTION_SIMPLE}
                  text="Update"
                  icon="paginationArrowLeft"
                  iconAfter
                  onClick={openManagePermissions}
                />
              </div>
              <div className="bottom-info-row">
                <div className="name">MVK Operators </div>
                <div className="value">
                  {mappedMVKOperators.firstAddress
                    ? <TzAddress tzAddress={mappedMVKOperators.firstAddress} type={BLUE} /> +
                      ` ${mappedMVKOperators.amount ?? ''}`
                    : 'None'}
                </div>
                <Button
                  kind={ACTION_SIMPLE}
                  text="Update"
                  icon="paginationArrowLeft"
                  iconAfter
                  onClick={openUpdateOperators}
                />
              </div>

              <Button
                text="Repay Loan in Full"
                kind={TRANSPARENT_WITH_BORDER}
                onClick={openRepayFull}
                className="close-vault"
                icon="close-stroke"
              />
            </>
          ) : null}
        </BorrowingTabListItemExpanded>
      </Expand>
    </>
  )
}

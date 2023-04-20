import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { LoansPopupsAddressInputStateType, ManagePermissionsPopupDataType } from './Modals.helpers'
import { State } from 'reducers'
import { validateTzAddress } from 'utils/validatorFunctions'

import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { DDItemId, DropDown, DropDownItemType } from 'app/App.components/DropDown/NewDropdown'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { AddRowBtn, RemoveRowBtn, Table, TableBody, TableCell, TableRow } from 'app/App.components/Table'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { managePermissionsAction } from 'pages/Loans/Actions/vaultPermissions.actions'
import {
  NONE_USER,
  WHITELIST_USERS,
  ANY_USER,
  VAULT_ALLOWANCE_ANY,
  VAULT_ALLOWANCE_ACCOUNTS,
} from 'pages/Loans/Loans.const'
import { LoanVaultAllowanceType } from 'utils/TypesAndInterfaces/Loans'
import { DropDownJsxChild } from 'app/App.components/DropDown/DropDown.style'

const ddItems = [
  { text: 'Vault Owner', value: NONE_USER },
  { text: 'Defined Accounts', value: WHITELIST_USERS },
  { text: 'Allow Any', value: ANY_USER },
]

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17307%3A226126&t=Sx2aEpp3ifrGxBtQ-0
export const ManagePermissions = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: ManagePermissionsPopupDataType
}) => {
  const { vaultAddress = '', deporsitorsFlag, depositors = [] } = data ?? {}

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const [tableData, setTableData] = useState<Array<LoansPopupsAddressInputStateType>>([
    { address: '', validationStatus: '' },
  ])

  const itemsForDropDown = useMemo<DropDownItemType[]>(
    () =>
      ddItems.map(({ text, value }) => ({
        content: <DropDownJsxChild>{text}</DropDownJsxChild>,
        id: value,
      })),
    [],
  )

  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()
  const handleOnClickDropdownItem = (itemId: DDItemId) => {
    const ddChoosenItem = itemsForDropDown.find(({ id }) => id === itemId)
    setChosenDdItem(ddChoosenItem)

    if (ddChoosenItem?.id === WHITELIST_USERS && tableData.length < 1) handleAddRow()
  }

  useEffect(() => {
    if (!show) {
      setTableData([{ address: '', validationStatus: '' }])
      setChosenDdItem(undefined)
    } else {
      // set initial data based on selected vault
      handleOnClickDropdownItem(deporsitorsFlag ?? '')
      setTableData(
        depositors.map((depositorAddress) => ({ address: depositorAddress, validationStatus: INPUT_STATUS_SUCCESS })),
      )
    }
  }, [show])

  const isActionDisabled = useMemo(() => {
    const isInvalidTable =
      chosenDdItem?.id === WHITELIST_USERS &&
      tableData.some(({ validationStatus }) => validationStatus !== INPUT_STATUS_SUCCESS)

    const isNoChanges =
      tableData.length === depositors.length &&
      tableData.every(({ address }) => depositors.includes(address)) &&
      deporsitorsFlag === chosenDdItem?.id

    return isActionLoading || isInvalidTable || !chosenDdItem || !vaultAddress || isNoChanges
  }, [chosenDdItem, deporsitorsFlag, depositors, isActionLoading, tableData, vaultAddress])

  const handleAddRow = () => {
    setTableData(tableData.concat([{ address: '', validationStatus: '' }]))
  }

  const handleDeleteRow = (rowId: number) => {
    setTableData(tableData.filter((_, idx) => idx !== rowId))
  }

  const updateTableDataState = (newValue: string, rowIdx: number) => {
    const validationStatus =
      validateTzAddress(newValue) && !tableData.some(({ address }) => address === newValue) && newValue !== accountPkh
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR

    setTableData(
      tableData.map((item, idx) => (idx === rowIdx ? { address: String(newValue), validationStatus } : item)),
    )
  }

  const updateHandler = () => {
    const depostiorAllowance: LoanVaultAllowanceType =
      chosenDdItem?.id === ANY_USER ? VAULT_ALLOWANCE_ANY : VAULT_ALLOWANCE_ACCOUNTS
    const newDepositors: Array<string> =
      chosenDdItem?.id === NONE_USER ? [] : tableData.map(({ address }) => address).filter(Boolean)
    dispatch(managePermissionsAction(vaultAddress, depostiorAllowance, newDepositors, depositors, closePopup))
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Manage Permissions</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">
            Manage permissions for depositing collateral to a selected vault. Note: these are advanced permissions and
            should be used by experts.
            <br />
            <br />- Vault Owner: Only vault owner
            <br />- Defined Accounts: Allow whitelisted addresses
            <br />- Allow Any: Any user may deposit collateral
          </div>

          <div className="block-name">Select Depositors</div>

          <DropDown
            placeholder="Choose Permissions"
            activeItem={chosenDdItem}
            items={itemsForDropDown}
            clickItem={handleOnClickDropdownItem}
          />

          {chosenDdItem?.id === WHITELIST_USERS ? (
            <Table className="editable-table one-column">
              <TableBody className="editable-body">
                {tableData.map(({ address, validationStatus }, rowIdx) => {
                  return (
                    <TableRow className="editable-row">
                      <TableCell width="100%">
                        <Input
                          className={`table-input`}
                          inputProps={{
                            placeholder: 'Enter tz1 address',
                            value: address,
                            type: 'text',
                            onChange: (e) => updateTableDataState(e.target.value, rowIdx),
                          }}
                          settings={{
                            inputStatus: validationStatus,
                          }}
                        />
                      </TableCell>

                      <RemoveRowBtn
                        className={`button-wrap remove ${tableData.length < 2 ? 'disabled' : ''}`}
                        onClick={() => handleDeleteRow(rowIdx)}
                      >
                        <CustomTooltip text="Delete row">
                          <Icon id="delete" />
                        </CustomTooltip>
                      </RemoveRowBtn>
                    </TableRow>
                  )
                })}
              </TableBody>
              <AddRowBtn className={`button-wrap `} onClick={handleAddRow}>
                <CustomTooltip text="Insert 1 row below">
                  <span>+</span>
                </CustomTooltip>
              </AddRowBtn>
            </Table>
          ) : null}

          <div className="manage-btn">
            <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={updateHandler} disabled={isActionDisabled}>
              Update
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

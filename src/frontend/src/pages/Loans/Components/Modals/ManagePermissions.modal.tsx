import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo, useState } from 'react'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { LoansPopupsAddressInputStateType, ManagePermissionsPopupDataType } from './Modals.helpers'
import { State } from 'reducers'
import { validateTzAddress } from 'utils/validatorFunctions'

import { DropDown, DropdownItemType } from 'app/App.components/DropDown/DropDown.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { managePermissionsAction } from 'pages/Loans/Loans.actions'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { AddRowBtn, RemoveRowBtn, Table, TableBody, TableCell, TableRow } from 'app/App.components/Table/Table.style'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'

const ddItems = [
  { text: 'Vault Owner', value: 'owner' },
  { text: 'Defined Accounts', value: 'selected' },
  { text: 'Allow Any', value: 'anyone' },
]
const dropDownListItems = ddItems.map(({ text }) => text)

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
  const {} = data ?? {}

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()
  const [tableData, setTableData] = useState<Array<LoansPopupsAddressInputStateType>>([
    { address: '', validationStatus: '' },
  ])

  useEffect(() => {
    if (!show) {
      setTableData([{ address: '', validationStatus: '' }])
      setChosenDdItem(undefined)
      setDdIsOpen(false)
    }
  }, [show])

  const isActionDisabled = useMemo(() => {
    return isActionLoading || tableData.some(({ validationStatus }) => validationStatus !== INPUT_STATUS_SUCCESS)
  }, [isActionLoading, tableData])

  const handleClickDropdownItem = (e: string) => {
    const chosenItem = ddItems.filter((item) => item.text === e)[0]
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
  }

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

  const updateHandler = () => dispatch(managePermissionsAction(closePopup))

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
            isOpen={ddIsOpen}
            setIsOpen={setDdIsOpen}
            itemSelected={chosenDdItem?.text}
            items={dropDownListItems}
            clickOnItem={(e) => handleClickDropdownItem(e)}
          />

          {chosenDdItem?.value === 'selected' ? (
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
                            onFocus: () => {
                              setDdIsOpen(false)
                            },
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
              <AddRowBtn className={`button-wrap add `} onClick={handleAddRow}>
                <CustomTooltip text="Insert 1 row below">
                  <span>+</span>
                </CustomTooltip>
              </AddRowBtn>
            </Table>
          ) : null}

          <NewButton
            kind={ACTION_PRIMARY}
            onClick={updateHandler}
            disabled={isActionDisabled}
            className="modal-manage-btn"
          >
            Update
          </NewButton>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

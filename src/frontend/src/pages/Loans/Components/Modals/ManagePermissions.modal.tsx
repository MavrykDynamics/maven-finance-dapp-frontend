import { useLockBodyScroll } from 'react-use'
import { useCallback, useEffect, useMemo, useState } from 'react'

// consts
import {
  ANY_USER,
  NONE_USER,
  VAULT_ALLOWANCE_ACCOUNTS,
  VAULT_ALLOWANCE_ANY,
  WHITELIST_USERS,
} from 'pages/Loans/Loans.const'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS, InputStatusType } from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_SIMPLE_SMALL, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { MANAGE_PERMISSIONS_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'

// types
import { LoanVaultAllowanceType } from 'providers/LoansProvider/loans.provider.types'
import { ManagePermissionsPopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'

// helpers
import { validateTzAddress } from 'utils/validatorFunctions'

// components
import { AddRowBtn, RemoveRowBtn, Table, TableBody, TableCell, TableRow } from 'app/App.components/Table'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import { DDItemId, DropDown, DropDownItemType } from 'app/App.components/DropDown/NewDropdown'
import Button from 'app/App.components/Button/NewButton'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

// styles
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { DropDownJsxChild } from 'app/App.components/DropDown/DropDown.style'

// actions
import { managePermissionsAction } from 'providers/VaultsProvider/actions/vaultPermissions.actions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// providers
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

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
  useLockBodyScroll(show)
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const [tableData, setTableData] = useState<Array<{ address: string; validationStatus: InputStatusType }>>([
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
    if (!show || !data) {
      setTableData([{ address: '', validationStatus: '' }])
      setChosenDdItem(undefined)
    } else {
      const { depositorsFlag, depositors } = data
      // set initial data based on selected vault
      handleOnClickDropdownItem(depositorsFlag ?? '')
      setTableData(
        depositors.map((depositorAddress) => ({
          address: depositorAddress,
          validationStatus: INPUT_STATUS_SUCCESS,
        })),
      )
    }
  }, [data, show])

  const { vaultAddress = '', depositorsFlag, depositors = [] } = data ?? {}

  const isActionDisabled =
    (chosenDdItem?.id === WHITELIST_USERS &&
      tableData.some(({ validationStatus }) => validationStatus !== INPUT_STATUS_SUCCESS)) ||
    (tableData.length === depositors.length &&
      tableData.every(({ address }) => depositors.includes(address)) &&
      depositorsFlag === chosenDdItem?.id) ||
    !chosenDdItem

  const handleAddRow = () => setTableData(tableData.concat([{ address: '', validationStatus: '' }]))
  const handleDeleteRow = (rowId: number) => setTableData(tableData.filter((_, idx) => idx !== rowId))

  const updateTableDataState = (newValue: string, rowIdx: number) => {
    const validationStatus =
      validateTzAddress(newValue) && !tableData.some(({ address }) => address === newValue) && newValue !== userAddress
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR

    setTableData(
      tableData.map((item, idx) => (idx === rowIdx ? { address: String(newValue), validationStatus } : item)),
    )
  }

  // manage permissions action
  const managePermissionsActionCb = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    const depostiorAllowance: LoanVaultAllowanceType =
      chosenDdItem?.id === ANY_USER ? VAULT_ALLOWANCE_ANY : VAULT_ALLOWANCE_ACCOUNTS
    const newDepositors: Array<string> =
      chosenDdItem?.id === NONE_USER ? [] : tableData.map(({ address }) => address).filter(Boolean)

    return await managePermissionsAction(
      vaultAddress,
      depostiorAllowance,
      newDepositors,
      depositors,
      userAddress,
      closePopup,
    )
  }, [bug, chosenDdItem?.id, closePopup, depositors, tableData, userAddress, vaultAddress])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: MANAGE_PERMISSIONS_ACTION,
      actionFn: managePermissionsActionCb,
    }),
    [managePermissionsActionCb],
  )

  const { action: updateHandler } = useContractAction(contractActionProps)

  if (!data) return null

  return (
    <PopupContainer onClick={closePopup} $show={show}>
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
                      <TableCell $width="100%">
                        <Input
                          className={`table-input`}
                          inputProps={{
                            placeholder: 'Enter mv1 address',
                            value: address,
                            type: 'text',
                            onChange: (e) => updateTableDataState(e.target.value, rowIdx),
                          }}
                          settings={{
                            inputStatus: validationStatus,
                          }}
                        />
                      </TableCell>

                      <RemoveRowBtn>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <Button
                              kind={BUTTON_SIMPLE_SMALL}
                              onClick={() => handleDeleteRow(rowIdx)}
                              disabled={tableData.length < 2}
                            >
                              <Icon id="delete" />
                            </Button>
                          </Tooltip.Trigger>
                          <Tooltip.Content>Delete row</Tooltip.Content>
                        </Tooltip>
                      </RemoveRowBtn>
                    </TableRow>
                  )
                })}
              </TableBody>
              <AddRowBtn>
                <Tooltip>
                  <Tooltip.Trigger>
                    <Button kind={BUTTON_SIMPLE_SMALL} onClick={handleAddRow}>
                      <Icon id="plus" />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Insert 1 row below</Tooltip.Content>
                </Tooltip>
              </AddRowBtn>
            </Table>
          ) : null}

          <div className="manage-btn">
            <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={updateHandler} disabled={isActionDisabled}>
              Update
            </Button>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

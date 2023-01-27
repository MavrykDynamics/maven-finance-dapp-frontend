import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useMemo, useState } from 'react'
import { useLockBodyScroll } from 'react-use'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { validateTzAddress } from 'utils/validatorFunctions'
import { LoansPopupsAddressInputStateType, UpdateOperatorsPopupDataType } from './Modals.helpers'
import { State } from 'reducers'
import { updateOperatorsAction } from 'pages/Loans/Loans.actions'

import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { AddRowBtn, RemoveRowBtn, Table, TableBody, TableCell, TableRow } from 'app/App.components/Table/Table.style'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17307%3A226700&t=Sx2aEpp3ifrGxBtQ-0
export const UpdateMVKOperator = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: UpdateOperatorsPopupDataType
}) => {
  const {} = data ?? {}

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { isActionLoading } = useSelector((state: State) => state.loading)

  const [tableData, setTableData] = useState<Array<LoansPopupsAddressInputStateType>>([
    { address: '', validationStatus: '' },
  ])

  useEffect(() => {
    if (!show) {
      setTableData([{ address: '', validationStatus: '' }])
    }
  }, [show])

  const isActionDisabled = useMemo(() => {
    return isActionLoading || tableData.some(({ validationStatus }) => validationStatus !== INPUT_STATUS_SUCCESS)
  }, [isActionLoading, tableData])

  const handleAddRow = () => setTableData(tableData.concat([{ address: '', validationStatus: '' }]))
  const handleDeleteRow = (rowId: number) => setTableData(tableData.filter((_, idx) => idx !== rowId))

  const updateTableDataState = (newValue: string, rowIdx: number) => {
    const validationStatus = validateTzAddress(newValue) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
    setTableData(
      tableData.map((item, idx) => (idx === rowIdx ? { address: String(newValue), validationStatus } : item)),
    )
  }

  const updateHandler = () => dispatch(updateOperatorsAction(closePopup))

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Update MVK Operators</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">
            Manage permissions for depositing collateral to a selected vault. Note: these are advanced permissions and
            should be used by experts.
            <br />
            <br />- Vault Owner: Only vault owner
            <br />- Defined Accounts: Allow whitelisted addresses
            <br />- Allow Any: Any user may deposit collateral
          </div>

          <Table className="editable-table one-column">
            <TableBody className="editable-body">
              {tableData.map(({ address, validationStatus }, rowIdx) => {
                return (
                  <TableRow className="editable-row">
                    <TableCell width="100%">
                      <Input
                        className={`table-input`}
                        inputProps={{
                          value: address,
                          placeholder: 'Enter tz1 address',
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
            <AddRowBtn className={`button-wrap add `} onClick={handleAddRow}>
              <CustomTooltip text="Insert 1 row below">
                <span>+</span>
              </CustomTooltip>
            </AddRowBtn>
          </Table>

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

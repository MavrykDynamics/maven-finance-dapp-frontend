import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLockBodyScroll } from 'react-use'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS, InputStatusType } from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { validateTzAddress } from 'utils/validatorFunctions'
import { UpdateOperatorsPopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { State } from 'reducers'
import { UpdateTokenOperator } from 'utils/TypesAndInterfaces/Loans'

import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { AddRowBtn, RemoveRowBtn, Table, TableBody, TableCell, TableRow } from 'app/App.components/Table'
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { updateOperatorsAction } from 'pages/Loans/Actions/vaultPermissions.actions'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { checkWhetherTokenIsLoanToken } from 'providers/TokensProvider/helpers/tokens.utils'

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
  const { vaultAddress = '', tokenAddress = '', operators = [] } = data ?? {}

  const { tokensMetadata } = useTokensContext()
  const loanToken = tokensMetadata[tokenAddress]

  useLockBodyScroll(show)
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const [tableData, setTableData] = useState<Array<{ address: string; validationStatus: InputStatusType }>>([
    { address: '', validationStatus: '' },
  ])

  useEffect(() => {
    if (!show) {
      setTableData([{ address: '', validationStatus: '' }])
    } else {
      const currentOperators: { address: string; validationStatus: InputStatusType }[] = operators.map((item) => ({
        address: item,
        validationStatus: INPUT_STATUS_SUCCESS,
      }))

      setTableData([{ address: '', validationStatus: '' }, ...currentOperators])
    }
  }, [show])

  const handleAddRow = () => setTableData(tableData.concat([{ address: '', validationStatus: '' }]))
  const handleDeleteRow = (rowId: number) => setTableData(tableData.filter((_, idx) => idx !== rowId))

  const updateTableDataState = (newValue: string, rowIdx: number) => {
    const validationStatus =
      validateTzAddress(newValue) && !tableData.some(({ address }) => address === newValue) && newValue !== accountPkh
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR
    setTableData(
      tableData.map((item, idx) => (idx === rowIdx ? { address: String(newValue), validationStatus } : item)),
    )
  }

  const getUpdatedOperators = useCallback(() => {
    const updateOperators: UpdateTokenOperator[] = []
    const tableAddresses = tableData.filter((item) => item.address).map((item) => item.address)

    // get operators to add
    tableAddresses.forEach((address) => {
      if (!operators.includes(address)) {
        updateOperators.push({
          add_operator: {
            owner: vaultAddress,
            operator: address,
            token_id: 0,
          },
        })
      }
    })

    // get operators to remove
    operators.forEach((address) => {
      if (!tableAddresses.includes(address)) {
        updateOperators.push({
          remove_operator: {
            owner: vaultAddress,
            operator: address,
            token_id: 0,
          },
        })
      }
    })

    return updateOperators
  }, [operators, tableData, vaultAddress])

  const updateHandler = () => {
    if (checkWhetherTokenIsLoanToken(loanToken)) {
      const updateOperators = getUpdatedOperators()
      dispatch(updateOperatorsAction(vaultAddress, loanToken.loanData.indexerName, updateOperators, closePopup))
    }
  }

  const isActionDisabled = useMemo(() => {
    // if length === 0 it means that the user has no changes to update
    const updatedOperatorLength = getUpdatedOperators().length

    return (
      tableData.some(({ validationStatus }) => validationStatus !== INPUT_STATUS_SUCCESS) || updatedOperatorLength === 0
    )
  }, [getUpdatedOperators, tableData])

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <GovRightContainerTitleArea>
            <h2>Update MVK Operators</h2>
          </GovRightContainerTitleArea>
          <div className="modalDescr">
            Add or remove operators from collateralized staked MVK in the vault. Note, this is an advanced feature and
            should only be done by experienced DeFi users.
          </div>

          <Table className="editable-table one-column">
            <TableBody className="editable-body">
              {tableData.map(({ address, validationStatus }, rowIdx) => {
                return (
                  <TableRow className="editable-row" key={rowIdx}>
                    <TableCell width="100%">
                      <Input
                        className={`table-input`}
                        inputProps={{
                          value: address,
                          placeholder: 'Enter address',
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

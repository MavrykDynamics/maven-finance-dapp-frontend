import React, { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

// view
import Icon from '../../app/App.components/Icon/Icon.view'
import { Input } from '../../app/App.components/Input/Input.controller'
import NewButton from 'app/App.components/Button/NewButton'

// type
import {
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from '../../app/App.components/Input/Input.constants'

// helpers
import { SatelliteGovernanceTransfer } from 'providers/SatellitesProvider/satellites.provider.types'
import { validateFormAddress, validateFormField, validateTzAddress } from 'utils/validatorFunctions'

// actions
import { fixMistakenTransfer } from './SatelliteGovernance.actions'

// style
import { AvailableActionsStyle } from './SatelliteGovernance.style'
import { ValidationResult } from 'pages/ProposalSubmission/ProposalSybmittion.types'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import {
  AddRowBtn,
  RemoveRowBtn,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from 'app/App.components/Table'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { TokenType } from 'utils/TypesAndInterfaces/General'

const TOKEN_TYPES: Array<TokenType> = ['fa12', 'fa2', 'tez']

const DEFAULT_TABLE: Array<SatelliteGovernanceTransfer> = [{ to_: '', amount: 0, token: TOKEN_TYPES[0] }]
const DEFAULT_TABLE_VALIDATION: Array<{
  to_: ValidationResult
  amount: ValidationResult
}> = [{ to_: '', amount: '' }]

const DEFAULT_FORM = {
  targetContractAddress: '',
  purpose: '',
}

const DEFAULT_FORM_VALIDATION: Record<string, InputStatusType> = {
  targetContractAddress: '',
  purpose: '',
}

type Props = {
  maxLength: { purposeMaxLength: number }
  isActionActive: boolean
}

export const FixMistakenTransferForm = ({ maxLength, isActionActive }: Props) => {
  const dispatch = useDispatch()
  const [tableData, setTableData] = useState(DEFAULT_TABLE)
  const [tableValidation, setTableValidation] = useState(DEFAULT_TABLE_VALIDATION)

  const DEFAULT_DROPDOWNS_STATE = useMemo(() => Array.from({ length: tableData.length }, () => false), [tableData])
  const [openDrop, setOpenDrop] = useState(DEFAULT_DROPDOWNS_STATE)

  const handleAddRow = () => {
    setTableData(tableData.concat({ to_: '', amount: 0, token: TOKEN_TYPES[0] }))
    setTableValidation(tableValidation.concat({ to_: '', amount: '' }))
  }

  const handleDeleteRow = (rowId: number) => {
    setTableData(tableData.filter((_, idx) => idx !== rowId))
    setTableValidation(tableValidation.filter((_, idx) => idx !== rowId))
  }

  const [form, setForm] = useState(DEFAULT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(DEFAULT_FORM_VALIDATION)

  const { targetContractAddress, purpose } = form

  const updateTableDataState = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string | number } },
    rowIdx: number,
  ) => {
    const { name, value } = e.target

    setTableData(
      tableData.map((item, idx) =>
        idx === rowIdx
          ? {
              ...item,
              [name]: value,
            }
          : item,
      ),
    )
  }

  const handleTableOnBlur = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string | number } },
    rowIdx: number,
  ) => {
    const { name, value } = e.target
    switch (name) {
      case 'to_':
        setTableValidation(
          tableValidation.map((item, idx) =>
            idx === rowIdx
              ? {
                  ...item,
                  [name]: validateTzAddress(value as string) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
                }
              : item,
          ),
        )
        break
      case 'amount':
        setTableValidation(
          tableValidation.map((item, idx) =>
            idx === rowIdx
              ? {
                  ...item,
                  [name]: Number(value) > 0 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
                }
              : item,
          ),
        )
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(fixMistakenTransfer(targetContractAddress, purpose, tableData))
      setForm(DEFAULT_FORM)
      setFormInputStatus(DEFAULT_FORM_VALIDATION)
      setTableData(DEFAULT_TABLE)
      setTableValidation(DEFAULT_TABLE_VALIDATION)
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  return (
    <AvailableActionsStyle>
      <form onSubmit={handleSubmit} className="inputs-block">
        <a
          className="info-link"
          href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
          target="_blank"
          rel="noreferrer"
        >
          <Icon id="question" />
        </a>
        <div>
          <h1>Fix Mistaken Transfer</h1>
          <p>Please enter a valid tz1 address of the satellite to take action on</p>
          <fieldset>
            <div className="satellite-address">
              <label>Target Contract Address</label>
              <Input
                value={targetContractAddress}
                name="targetContractAddress"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                }}
                onBlur={handleBlurAddress}
                inputStatus={formInputStatus.targetContractAddress}
              />
            </div>
            <div className="satellite-address">
              <label>Purpose</label>
              <Input
                value={purpose}
                name="purpose"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, maxLength.purposeMaxLength)}
                inputStatus={formInputStatus.purpose}
              />
            </div>
          </fieldset>
          <label>Transfer List</label>
        </div>
        <Table className="editable-table with-header">
          <TableHeader className="editable-head">
            <TableRow>
              <TableHeaderCell className="no-right-border">Address</TableHeaderCell>
              <TableHeaderCell>Purpose</TableHeaderCell>
              <TableHeaderCell className="right-border">Token Type (FA12/FA2/TEZ)</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody className="editable-body">
            {tableData.map(({ to_, token, amount }, rowIdx) => {
              return (
                <TableRow className="editable-row">
                  <TableCell width="33.3%">
                    <Input
                      value={String(to_)}
                      inputStatus={tableValidation[rowIdx]?.to_}
                      onChange={(e) => updateTableDataState(e, rowIdx)}
                      onBlur={(e) => handleTableOnBlur(e, rowIdx)}
                      onFocus={() => setOpenDrop(DEFAULT_DROPDOWNS_STATE)}
                      name={'to_'}
                      type={'text'}
                    />
                  </TableCell>
                  <TableCell width="33.3%">
                    <Input
                      value={Number(amount)}
                      inputStatus={tableValidation[rowIdx]?.amount}
                      onChange={(e) => updateTableDataState(e, rowIdx)}
                      onBlur={(e) => handleTableOnBlur(e, rowIdx)}
                      onFocus={() => setOpenDrop(DEFAULT_DROPDOWNS_STATE)}
                      name={'amount'}
                      type={'number'}
                    />
                  </TableCell>
                  <TableCell className="no-right-border" width="33.3%">
                    <DropDown
                      placeholder={''}
                      items={TOKEN_TYPES}
                      isOpen={openDrop[rowIdx]}
                      itemSelected={String(token)}
                      setIsOpen={(newDropDownState: boolean) => {
                        setOpenDrop(openDrop.map((_, idx) => (idx === rowIdx ? newDropDownState : false)))
                      }}
                      clickOnItem={(newSelectedSymbol: string) => {
                        updateTableDataState(
                          {
                            target: { name: 'token', value: newSelectedSymbol },
                          },
                          rowIdx,
                        )
                      }}
                      className="stage-3-dropDown"
                    />
                  </TableCell>

                  <RemoveRowBtn className={`button-wrap remove`} onClick={() => handleDeleteRow(rowIdx)}>
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

        <div className="suspend-satellite-group">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={isActionActive} type={SUBMIT}>
            <Icon id="gear" /> Fix Mistaken Transfer
          </NewButton>
        </div>
      </form>
    </AvailableActionsStyle>
  )
}

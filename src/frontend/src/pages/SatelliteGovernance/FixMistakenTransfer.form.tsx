import React, { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

// view
import Icon from '../../app/App.components/Icon/Icon.view'
import { Input } from '../../app/App.components/Input/Input.controller'
import { Button } from '../../app/App.components/Button/Button.controller'

// type
import {
  InputStatusType,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from '../../app/App.components/Input/Input.constants'

// helpers
import { SatelliteGovernanceTransfer, TokenType } from '../../utils/TypesAndInterfaces/Delegation'
import { validateFormField, validateFormAddress, validateTzAddress } from 'utils/validatorFunctions'

// actions
import { fixMistakenTransfer } from './SatelliteGovernance.actions'

// style
import { AvailableActionsStyle } from './SatelliteGovernance.style'
import Table, { TableProps } from 'app/App.components/Table/Table.controller'
import { ValidationResult } from 'pages/ProposalSubmission/ProposalSybmittion.types'
import { CellType } from 'app/App.components/Table/TableCell'
import { ACTION_PRIMARY, SUBMIT } from 'app/App.components/Button/Button.constants'

const TOKEN_TYPES: Array<TokenType> = ['FA12', 'FA2', 'TEZ']

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
}

export const FixMistakenTransferForm = ({ maxLength }: Props) => {
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
              ? { ...item, [name]: validateTzAddress(value as string) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR }
              : item,
          ),
        )
        break
      case 'amount':
        setTableValidation(
          tableValidation.map((item, idx) =>
            idx === rowIdx ? { ...item, [name]: Number(value) > 0 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR } : item,
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

  const mappedTableData = useMemo(() => {
    return tableData.map<TableProps['data'][number]>(({ to_, amount, token }, idx) => {
      return [
        {
          cellValue: to_,
          cellType: 'input' as CellType,
          inputProps: {
            inputStatus: tableValidation[idx].to_,
            onChange: updateTableDataState,
            onBlur: handleTableOnBlur,
            onFocus: () => setOpenDrop(DEFAULT_DROPDOWNS_STATE),
            name: 'to_',
            type: 'text',
          },
        },
        {
          cellValue: amount,
          cellType: 'input' as CellType,
          inputProps: {
            inputStatus: tableValidation[idx].amount,
            onChange: updateTableDataState,
            onBlur: handleTableOnBlur,
            onFocus: () => setOpenDrop(DEFAULT_DROPDOWNS_STATE),
            name: 'amount',
            type: 'number',
          },
        },
        {
          cellValue: token,
          cellType: 'dropDown' as CellType,
          dropDownProps: {
            items: TOKEN_TYPES,
            isOpen: openDrop[idx],
            clickOnItem: (rowIdx: number) => (newSelectedSymbol: string) => {
              updateTableDataState(
                {
                  target: { name: 'token', value: newSelectedSymbol },
                },
                rowIdx,
              )
            },
            setIsOpen: (newState: Array<boolean>) => setOpenDrop(newState),
          },
        },
      ]
    })
  }, [openDrop, tableData, tableValidation])

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
        <Table
          data={mappedTableData}
          colunmNames={['Address', 'Amount', 'Token Type (FA12/FA2/TEZ)']}
          addRowHandler={handleAddRow}
          removeRowHandler={handleDeleteRow}
        />
        <div className="suspend-satellite-group">
          <Button icon="plus" kind={ACTION_PRIMARY} text={'Fix Mistaken Transfer'} type={SUBMIT} />
        </div>
      </form>
    </AvailableActionsStyle>
  )
}

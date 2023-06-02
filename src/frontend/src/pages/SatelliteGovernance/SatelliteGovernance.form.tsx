import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

// view
import Icon from '../../app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'
import Button from 'app/App.components/Button/NewButton'
import { TextArea } from '../../app/App.components/TextArea/TextArea.controller'
import { DDItemId, DropDown, getDdItem } from 'app/App.components/DropDown/NewDropdown'
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

// type
import {
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from '../../app/App.components/Input/Input.constants'

// actions
import {
  addOracleToAggregator,
  banSatellite,
  removeOracleInAggregator,
  removeOracles,
  restoreSatellite,
  setAggregatorMaintainer,
  suspendSatellite,
  unbanSatellite,
  unsuspendSatellite,
  updateAggregatorStatus,
  registerAggregator,
  fixMistakenTransfer,
} from './SatelliteGovernance.actions'

// style
import { SatelliteGovernanceAvailableAction } from './SatelliteGovernance.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// helpers
import { validateFormAddress, validateFormField, validateTzAddress } from 'utils/validatorFunctions'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  SATELLITE_GOVERNANCE_CONTENT_FORM,
  SATELLITE_GOVERNANCE_DEFAULT_TABLE,
  SATELLITE_GOVERNANCE_DEFAULT_TABLE_VALIDATION,
  SATELLITE_GOVERNANCE_TOKEN_TYPES,
  SATELLITE_GOVERNANCE_ACTION_NAMES,
} from './SatelliteGovernance.consts'

type MaxLength = {
  purposeMaxLength: number
  aggregatorNameMaxLength: number
}

type InputStatus = Record<string, InputStatusType>
type InputValue = {
  firstInput: string
  secondInput: string
  purpose: string
}

const initialData = {
  firstInput: '',
  secondInput: '',
  purpose: '',
} as InputValue & InputStatus

type Props = {
  variant: string
  maxLength: MaxLength
  isActionActive: boolean
}

export const SatelliteGovernanceForm = ({ variant, maxLength, isActionActive }: Props) => {
  const dispatch = useDispatch()

  const dropDownItems = useMemo(() => SATELLITE_GOVERNANCE_TOKEN_TYPES.map((item) => getDdItem(item.toUpperCase())), [])
  const [tableData, setTableData] = useState(SATELLITE_GOVERNANCE_DEFAULT_TABLE)
  const [tableValidation, setTableValidation] = useState(SATELLITE_GOVERNANCE_DEFAULT_TABLE_VALIDATION)

  const [form, setForm] = useState<InputValue>(initialData)
  const [formInputStatus, setFormInputStatus] = useState<InputStatus>(initialData)

  const { firstInput, secondInput, purpose } = form
  const { title, btnText, btnIcon, firstInputLabel, secondInputLabel } =
    SATELLITE_GOVERNANCE_CONTENT_FORM.get(variant) ?? {}

  const isDisabledButton = useMemo(
    () => Object.values(formInputStatus).some((item) => item === INPUT_STATUS_ERROR) || isActionActive,
    [formInputStatus, isActionActive],
  )
  const isFixMistakenTransfer = variant === SATELLITE_GOVERNANCE_ACTION_NAMES.FIX_MISTAKEN_TRANSFER
  const isFieldRegisterAggregator = variant === SATELLITE_GOVERNANCE_ACTION_NAMES.REGISTER_AGGREGATOR

  const toShowPurpose = !isFieldRegisterAggregator && !isFixMistakenTransfer
  const toShowSecondInput =
    variant === SATELLITE_GOVERNANCE_ACTION_NAMES.SET_AGREGATOR_MANTAINER ||
    variant === SATELLITE_GOVERNANCE_ACTION_NAMES.UPDATE_AGREGATOR_STATUS ||
    isFieldRegisterAggregator ||
    isFixMistakenTransfer

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    switch (variant) {
      case SATELLITE_GOVERNANCE_ACTION_NAMES.SUSPEND_SATELLITE:
        await dispatch(suspendSatellite(firstInput, purpose))
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.UNSUSPEND_SATELLITE:
        await dispatch(unsuspendSatellite(firstInput, purpose))
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.BAN_SATELLITE:
        await dispatch(banSatellite(firstInput, purpose))
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.UNBAN_SATELLITE:
        await dispatch(unbanSatellite(firstInput, purpose))
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.REMOVE_ORACLES:
        await dispatch(removeOracles(firstInput, purpose))
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.RESTORE_SATELLITE:
        await dispatch(restoreSatellite(firstInput, purpose))
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.REMOVE_FROM_AGREGATOR:
        await dispatch(removeOracleInAggregator(secondInput, firstInput, purpose))
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.ADD_TO_AGGREGATOR:
        await dispatch(addOracleToAggregator(secondInput, firstInput, purpose))
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.SET_AGREGATOR_MANTAINER:
        await dispatch(setAggregatorMaintainer(secondInput, firstInput, purpose))
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.UPDATE_AGREGATOR_STATUS:
        await dispatch(updateAggregatorStatus(secondInput, firstInput, purpose))
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.REGISTER_AGGREGATOR:
        await dispatch(registerAggregator(secondInput, firstInput))
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.FIX_MISTAKEN_TRANSFER:
        await dispatch(fixMistakenTransfer(secondInput, firstInput, tableData))
        break
    }

    setForm({
      secondInput: '',
      firstInput: '',
      purpose: '',
    })

    setFormInputStatus({
      secondInput: '',
      firstInput: '',
      purpose: '',
    })
  }

  const validationText = validateFormField(setFormInputStatus)
  const validationAddress = validateFormAddress(setFormInputStatus)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const updateTableDataState = (
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

  const handleAddRow = () => {
    setTableData(tableData.concat({ to_: '', amount: 0, token: SATELLITE_GOVERNANCE_TOKEN_TYPES[0] }))
    setTableValidation(tableValidation.concat({ to_: '', amount: '' }))
  }

  const handleDeleteRow = (rowId: number) => {
    setTableData(tableData.filter((_, idx) => idx !== rowId))
    setTableValidation(tableValidation.filter((_, idx) => idx !== rowId))
  }

  const handleTableClickDropdown = (rowIdx: number) => (newSelectedSymbol: DDItemId) => {
    updateTableDataState(
      {
        target: { name: 'token', value: newSelectedSymbol },
      },
      rowIdx,
    )
  }

  useEffect(() => {
    setForm(initialData)
    setFormInputStatus(initialData)
  }, [variant])

  if (!variant) return null

  return (
    <SatelliteGovernanceAvailableAction onSubmit={handleSubmit}>
      <a
        href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
        target="_blank"
        rel="noreferrer"
      >
        <CustomTooltip iconId="question" />
      </a>

      <div>
        <H2Title>{title}</H2Title>
        <p>Please enter a valid tz1 address of the satellite to take action on</p>
      </div>

      <fieldset>
        <div>
          <label>{firstInputLabel}</label>

          <Input
            inputProps={{
              name: 'firstInput',
              value: firstInput,
              required: true,

              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e)
                isFieldRegisterAggregator ? validationText(e, maxLength.aggregatorNameMaxLength) : validationAddress(e)
              },
            }}
            settings={{ inputStatus: formInputStatus.firstInput }}
          />
        </div>

        {toShowSecondInput && (
          <div>
            <label>{secondInputLabel}</label>

            <Input
              inputProps={{
                name: 'secondInput',
                value: secondInput,
                required: true,

                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                  isFixMistakenTransfer ? validationText(e, maxLength.purposeMaxLength) : validationAddress(e)
                },
              }}
              settings={{ inputStatus: formInputStatus.secondInput }}
            />
          </div>
        )}
      </fieldset>

      {toShowPurpose && (
        <div>
          <label>Purpose</label>

          <TextArea
            value={purpose}
            name="purpose"
            required
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              handleChange(e)
              validationText(e, maxLength.purposeMaxLength)
            }}
            inputStatus={formInputStatus.purpose}
            textAreaMaxLimit={maxLength.purposeMaxLength}
          />
        </div>
      )}

      {isFixMistakenTransfer && (
        <div>
          <label>Transfer List</label>

          <Table className="fix-mistaken-transfer-table editable-table with-header">
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
                        inputProps={{
                          type: 'text',
                          name: 'to_',
                          value: String(to_),
                          onChange: (e) => updateTableDataState(e, rowIdx),
                        }}
                        settings={{ inputStatus: tableValidation[rowIdx]?.to_ }}
                      />
                    </TableCell>
                    <TableCell width="33.3%">
                      <Input
                        inputProps={{
                          type: 'number',
                          name: 'amount',
                          value: Number(amount),
                          onChange: (e) => updateTableDataState(e, rowIdx),
                        }}
                        settings={{ inputStatus: tableValidation[rowIdx]?.amount }}
                      />
                    </TableCell>
                    <TableCell className="no-right-border" width="33.3%">
                      <DropDown
                        placeholder=""
                        activeItem={getDdItem(token.toUpperCase())}
                        items={dropDownItems}
                        clickItem={handleTableClickDropdown(rowIdx)}
                        className="stage-3-dropDown"
                      />
                    </TableCell>

                    <RemoveRowBtn className="button-wrap remove" onClick={() => handleDeleteRow(rowIdx)}>
                      <CustomTooltip text="Delete row">
                        <Icon id="delete" />
                      </CustomTooltip>
                    </RemoveRowBtn>
                  </TableRow>
                )
              })}
            </TableBody>
            <AddRowBtn className="button-wrap add" onClick={handleAddRow}>
              <CustomTooltip text="Insert 1 row below">
                <span>+</span>
              </CustomTooltip>
            </AddRowBtn>
          </Table>
        </div>
      )}

      <div className="button-wrapper">
        <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={isDisabledButton} type={SUBMIT}>
          {btnIcon && <Icon id={btnIcon} />}
          {btnText}
        </Button>
      </div>
    </SatelliteGovernanceAvailableAction>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

// view
import Icon from '../../app/App.components/Icon/Icon.view'
import { Input } from '../../app/App.components/Input/Input.controller'
import Button from 'app/App.components/Button/NewButton'
import { TextArea } from '../../app/App.components/TextArea/TextArea.controller'

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

// helpers
import { validateFormAddress, validateFormField, validateTzAddress } from 'utils/validatorFunctions'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import { SatelliteGovernanceTransfer } from 'utils/TypesAndInterfaces/Satellites'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { ValidationResult } from 'pages/ProposalSubmission/ProposalSubmission.types'
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
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

const handleComparingValue = (value: string) => {
  return value.replaceAll(' ', '').toLowerCase()
}

const compareValues = (a: string, b: string) => {
  return handleComparingValue(a) === handleComparingValue(b)
}

type MaxLength = {
  purposeMaxLength: number
  aggregatorNameMaxLength: number
}

type Props = {
  variant: string
  maxLength: MaxLength
  isActionActive: boolean
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

const CONTENT_FORM = new Map([
  [
    'Suspend Satellite',
    {
      title: 'Suspend Satellite',
      btnText: 'Suspend Satellite',
      btnIcon: 'minus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Unsuspend Satellite',
    {
      title: 'Unsuspend Satellite',
      btnText: 'Unsuspend Satellite',
      btnIcon: 'plus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Ban Satellite',
    {
      title: 'Ban Satellite',
      btnText: 'Ban Satellite',
      btnIcon: 'navigation-menu_close',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Unban Satellite',
    {
      title: 'Unban Satellite',
      btnText: 'Unban Satellite',
      btnIcon: 'plus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Remove Oracles',
    {
      title: 'Remove all Oracles from Satellite',
      btnText: 'Remove Oracles',
      btnIcon: 'minus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Remove from Aggregator',
    {
      title: 'Remove from Aggregator',
      btnText: 'Remove from Aggregator',
      btnIcon: 'minus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Add to Aggregator',
    {
      title: 'Add Oracle to Aggregator',
      btnText: 'Add to Aggregator',
      btnIcon: 'plus',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Restore Satellite',
    {
      title: 'Restore Satellite',
      btnText: 'Restore Satellite',
      btnIcon: 'restore',
      firstInputLabel: 'Your Address',
      secondInputLabel: '',
    },
  ],
  [
    'Set Aggregator Maintainer',
    {
      title: 'Set Aggregator Maintainer',
      btnText: 'Set Aggregator Maintainer',
      btnIcon: 'gear',
      firstInputLabel: 'Maintainer',
      secondInputLabel: 'Aggregator Address',
    },
  ],
  [
    'Update Aggregator Status',
    {
      title: 'Update Aggregator Status',
      btnText: 'Update Aggregator Status',
      btnIcon: 'update',
      firstInputLabel: 'Status',
      secondInputLabel: 'Aggregator Address',
    },
  ],
  [
    'Register Aggregator',
    {
      title: 'Register Aggregator',
      btnText: 'Register Aggregator',
      btnIcon: 'plus',
      firstInputLabel: 'Aggregator Pair',
      secondInputLabel: 'Aggregator Address',
    },
  ],
  [
    'Fix Mistaken Transfer',
    {
      title: 'Fix Mistaken Transfer',
      btnText: 'Fix Mistaken Transfer',
      btnIcon: 'gear',
      firstInputLabel: 'Target Contract Address',
      secondInputLabel: 'Purpose',
    },
  ],
])

const TOKEN_TYPES: Array<TokenType> = ['fa12', 'fa2', 'tez']
const DEFAULT_TABLE: Array<SatelliteGovernanceTransfer> = [{ to_: '', amount: 0, token: TOKEN_TYPES[0] }]
const DEFAULT_TABLE_VALIDATION: Array<{
  to_: ValidationResult
  amount: ValidationResult
}> = [{ to_: '', amount: '' }]

export const SatelliteGovernanceForm = ({ variant, maxLength, isActionActive }: Props) => {
  const dispatch = useDispatch()

  const [tableData, setTableData] = useState(DEFAULT_TABLE)
  const [tableValidation, setTableValidation] = useState(DEFAULT_TABLE_VALIDATION)

  const [form, setForm] = useState<InputValue>(initialData)
  const [formInputStatus, setFormInputStatus] = useState<InputStatus>(initialData)

  const DEFAULT_DROPDOWNS_STATE = useMemo(() => Array.from({ length: tableData.length }, () => false), [tableData])
  const [openDrop, setOpenDrop] = useState(DEFAULT_DROPDOWNS_STATE)

  const { firstInput, secondInput, purpose } = form
  const { title, btnText, btnIcon, firstInputLabel, secondInputLabel } = CONTENT_FORM.get(variant) ?? {}

  const isFixMistakenTransfer = compareValues(variant, 'fixMistakenTransfer')
  const isFieldRegisterAggregator = compareValues(variant, 'registerAggregator')

  const toShowPurpose = !isFieldRegisterAggregator && !isFixMistakenTransfer
  const toShowSecondInput =
    compareValues(variant, 'setAggregatorMaintainer') ||
    compareValues(variant, 'updateAggregatorStatus') ||
    isFieldRegisterAggregator ||
    isFixMistakenTransfer

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    switch (handleComparingValue(variant)) {
      case handleComparingValue('suspendSatellite'):
        await dispatch(suspendSatellite(firstInput, purpose))
        break
      case handleComparingValue('unsuspendSatellite'):
        await dispatch(unsuspendSatellite(firstInput, purpose))
        break
      case handleComparingValue('banSatellite'):
        await dispatch(banSatellite(firstInput, purpose))
        break
      case handleComparingValue('unbanSatellite'):
        await dispatch(unbanSatellite(firstInput, purpose))
        break
      case handleComparingValue('removeOracles'):
        await dispatch(removeOracles(firstInput, purpose))
        break
      case handleComparingValue('restoreSatellite'):
        await dispatch(restoreSatellite(firstInput, purpose))
        break
      case handleComparingValue('removeFromAggregator'):
        await dispatch(removeOracleInAggregator(secondInput, firstInput, purpose))
        break
      case handleComparingValue('addToAggregator'):
        await dispatch(addOracleToAggregator(secondInput, firstInput, purpose))
        break
      case handleComparingValue('setAggregatorMaintainer'):
        await dispatch(setAggregatorMaintainer(secondInput, firstInput, purpose))
        break
      case handleComparingValue('updateAggregatorStatus'):
        await dispatch(updateAggregatorStatus(secondInput, firstInput, purpose))
        break
      case handleComparingValue('registerAggregator'):
        await dispatch(registerAggregator(secondInput, firstInput))
        break
      case handleComparingValue('fixMistakenTransfer'):
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

  const handleAddRow = () => {
    setTableData(tableData.concat({ to_: '', amount: 0, token: TOKEN_TYPES[0] }))
    setTableValidation(tableValidation.concat({ to_: '', amount: '' }))
  }

  const handleDeleteRow = (rowId: number) => {
    setTableData(tableData.filter((_, idx) => idx !== rowId))
    setTableValidation(tableValidation.filter((_, idx) => idx !== rowId))
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
            value={firstInput}
            name="firstInput"
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(e)
              isFieldRegisterAggregator ? validationText(e, maxLength.aggregatorNameMaxLength) : validationAddress(e)
            }}
            inputStatus={formInputStatus.firstInput}
          />
        </div>

        {toShowSecondInput && (
          <div>
            <label>{secondInputLabel}</label>

            <Input
              value={secondInput}
              name="secondInput"
              required
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleChange(e)
                isFixMistakenTransfer ? validationText(e, maxLength.purposeMaxLength) : validationAddress(e)
              }}
              inputStatus={formInputStatus.secondInput}
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
        <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={isActionActive} type={SUBMIT}>
          {btnIcon && <Icon id={btnIcon} />}
          {btnText}
        </Button>
      </div>
    </SatelliteGovernanceAvailableAction>
  )
}

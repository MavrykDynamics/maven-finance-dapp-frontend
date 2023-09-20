import { useEffect, useMemo, useState } from 'react'

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
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from '../../app/App.components/Input/Input.constants'
import { TokenType } from 'utils/TypesAndInterfaces/General'

// style
import { SatelliteGovernanceAvailableAction } from './SatelliteGovernance.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// helpers
import { validateText, validateTzAddress } from 'utils/validatorFunctions'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  SATELLITE_GOVERNANCE_CONTENT_FORM,
  SATELLITE_GOVERNANCE_TOKEN_TYPES,
  SATELLITE_GOVERNANCE_ACTION_NAMES,
  SATELLITE_GOVERNANCE_INITIAL_DATA,
  SATELLITE_GOVERNANCE_INITIAL_VALIDATION_DATA,
} from './SatelliteGovernance.consts'

// hooks
import { useSatelliteGovActions } from './useSatelliteGovActions'

type MaxLength = {
  purposeMaxLength: number
  aggregatorNameMaxLength: number
}

type Props = {
  variant?: keyof typeof SATELLITE_GOVERNANCE_CONTENT_FORM
  maxLength: MaxLength
  isButtonDisabled: boolean
}

export const SatelliteGovernanceForm = ({ variant, maxLength, isButtonDisabled }: Props) => {
  const dropDownItems = useMemo(() => SATELLITE_GOVERNANCE_TOKEN_TYPES.map((item) => getDdItem(item.toUpperCase())), [])

  const [data, setData] = useState(SATELLITE_GOVERNANCE_INITIAL_DATA)
  const [validation, setValidation] = useState(SATELLITE_GOVERNANCE_INITIAL_VALIDATION_DATA)

  const { firstInput: satelliteAddress, secondInput: oracleAddress, purpose, table } = data
  const {
    title = '',
    btnText = '',
    btnIcon = '',
    firstInputLabel = '',
    secondInputLabel = '',
  } = variant ? SATELLITE_GOVERNANCE_CONTENT_FORM[variant] : {}

  const internalButtonDisabledStatus = useMemo(
    () =>
      Object.values(validation).some((item) => item === INPUT_STATUS_ERROR) ||
      validation.table.some((item) => item.amount === INPUT_STATUS_ERROR || item.to_ === INPUT_STATUS_ERROR) ||
      isButtonDisabled,
    [validation, isButtonDisabled],
  )

  const isFixMistakenTransfer = variant === SATELLITE_GOVERNANCE_ACTION_NAMES.FIX_MISTAKEN_TRANSFER
  const isFieldRegisterAggregator = variant === SATELLITE_GOVERNANCE_ACTION_NAMES.REGISTER_AGGREGATOR

  const toShowPurpose = !isFieldRegisterAggregator && !isFixMistakenTransfer
  const toShowSecondInput =
    // show if available action === Set Aggregator Maintainer
    variant === SATELLITE_GOVERNANCE_ACTION_NAMES.SET_AGREGATOR_MANTAINER ||
    // show if available action === Update Aggregator Status
    variant === SATELLITE_GOVERNANCE_ACTION_NAMES.UPDATE_AGREGATOR_STATUS ||
    // show if available action === Register Aggregator
    isFieldRegisterAggregator ||
    // show if available action === Fix Mistaken Transfer
    isFixMistakenTransfer

  const {
    suspendSatelliteAction,
    unsuspendSatelliteAction,
    banSatelliteAction,
    unbanSatelliteAction,
    removeOraclesAction,
    restoreSatelliteAction,
    removeOracleInAggregatorAction,
    addOracleToAggregatorAction,
    setAggregatorMaintainerAction,
    updateAggregatorStatusAction,
    registerAggregatorAction,
    fixMistakenTransferAction,
  } = useSatelliteGovActions(satelliteAddress, oracleAddress, purpose)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    switch (variant) {
      case SATELLITE_GOVERNANCE_ACTION_NAMES.SUSPEND_SATELLITE:
        await suspendSatelliteAction()
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.UNSUSPEND_SATELLITE:
        await unsuspendSatelliteAction()
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.BAN_SATELLITE:
        await banSatelliteAction()
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.UNBAN_SATELLITE:
        await unbanSatelliteAction()
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.REMOVE_ORACLES:
        await removeOraclesAction()
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.RESTORE_SATELLITE:
        await restoreSatelliteAction()
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.REMOVE_FROM_AGREGATOR:
        await removeOracleInAggregatorAction()
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.ADD_TO_AGGREGATOR:
        await addOracleToAggregatorAction()
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.SET_AGREGATOR_MANTAINER:
        await setAggregatorMaintainerAction()
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.UPDATE_AGREGATOR_STATUS:
        await updateAggregatorStatusAction()
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.REGISTER_AGGREGATOR:
        await registerAggregatorAction()
        break
      case SATELLITE_GOVERNANCE_ACTION_NAMES.FIX_MISTAKEN_TRANSFER:
        // get only filled table data
        const validatedTableData = table.filter((item) => Boolean(item.amount) && Boolean(item.to_))
        await fixMistakenTransferAction(validatedTableData)
        break
    }

    setData(SATELLITE_GOVERNANCE_INITIAL_DATA)
    setValidation(SATELLITE_GOVERNANCE_INITIAL_VALIDATION_DATA)
  }

  const validationText = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
    maxLength?: number,
  ) => {
    const { value, name } = e.target

    setValidation((prev) => {
      return { ...prev, [name]: validateText(value, maxLength) }
    })
  }

  const validationAddress = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, name } = e.target

    setValidation((prev) => {
      return { ...prev, [name]: validateTzAddress(value) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR }
    })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
    rowIdx?: number,
  ) => {
    const { name, value } = e.target

    // validation
    switch (name) {
      case 'firstInput':
        isFieldRegisterAggregator ? validationText(e, maxLength.aggregatorNameMaxLength) : validationAddress(e)
        break
      case 'secondInput':
        isFixMistakenTransfer ? validationText(e, maxLength.purposeMaxLength) : validationAddress(e)
        break
      case 'purpose':
        validationText(e, maxLength.purposeMaxLength)
        break
      case 'to_':
        setValidation((prev) => ({
          ...prev,
          table: prev.table.map((item, idx) =>
            idx === rowIdx
              ? {
                  ...item,
                  [name]: validateTzAddress(value as string) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
                }
              : item,
          ),
        }))
        break
      case 'amount':
        setValidation((prev) => ({
          ...prev,
          table: prev.table.map((item, idx) =>
            idx === rowIdx
              ? {
                  ...item,
                  [name]: Number(value) > 0 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
                }
              : item,
          ),
        }))
        break
    }

    // set data
    switch (name) {
      case 'firstInput':
      case 'secondInput':
      case 'purpose':
        setData((prev) => {
          return { ...prev, [e.target.name]: e.target.value }
        })
        break
      case 'to_':
      case 'amount':
        setData((prev) => {
          return {
            ...prev,
            table: prev.table.map((item, idx) =>
              idx === rowIdx
                ? {
                    ...item,
                    [name]: value,
                  }
                : item,
            ),
          }
        })
        break
    }
  }

  const handleAddRow = () => {
    setData((prev) => ({
      ...prev,
      table: prev.table.concat({ to_: '', amount: 0, token: SATELLITE_GOVERNANCE_TOKEN_TYPES[0] }),
    }))

    setValidation((prev) => ({
      ...prev,
      table: prev.table.concat({ to_: '', amount: '' }),
    }))
  }

  const handleDeleteRow = (rowId: number) => {
    setData((prev) => ({
      ...prev,
      table: prev.table.filter((_, idx) => idx !== rowId),
    }))

    setValidation((prev) => ({
      ...prev,
      table: prev.table.filter((_, idx) => idx !== rowId),
    }))
  }

  const handleTableClickDropdown = (rowIdx: number) => (newSelectedSymbol: DDItemId) => {
    setData((prev) => ({
      ...prev,
      table: prev.table.map((item, idx) =>
        idx === rowIdx
          ? {
              ...item,
              token: newSelectedSymbol as TokenType,
            }
          : item,
      ),
    }))
  }

  useEffect(() => {
    setData(SATELLITE_GOVERNANCE_INITIAL_DATA)
    setValidation(SATELLITE_GOVERNANCE_INITIAL_VALIDATION_DATA)
  }, [variant])

  if (!variant) return null

  return (
    <SatelliteGovernanceAvailableAction onSubmit={handleSubmit}>
      <a
        href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
        target="_blank"
        rel="noreferrer"
        className="info-link"
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
              value: satelliteAddress,
              required: true,

              onChange: handleChange,
            }}
            settings={{ inputStatus: validation.firstInput }}
          />
        </div>

        {toShowSecondInput && (
          <div>
            <label>{secondInputLabel}</label>

            <Input
              inputProps={{
                name: 'secondInput',
                value: oracleAddress,
                required: true,

                onChange: handleChange,
              }}
              settings={{ inputStatus: validation.secondInput }}
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
            onChange={handleChange}
            inputStatus={validation.purpose}
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
              {table.map(({ to_, token, amount }, rowIdx) => {
                return (
                  <TableRow className="editable-row">
                    <TableCell width="33.3%">
                      <Input
                        inputProps={{
                          type: 'text',
                          name: 'to_',
                          value: String(to_),
                          onChange: (e) => handleChange(e, rowIdx),
                        }}
                        settings={{ inputStatus: validation.table[rowIdx]?.to_ }}
                      />
                    </TableCell>
                    <TableCell width="33.3%">
                      <Input
                        inputProps={{
                          type: 'number',
                          name: 'amount',
                          value: Number(amount),
                          onChange: (e) => handleChange(e, rowIdx),
                        }}
                        settings={{ inputStatus: validation.table[rowIdx]?.amount }}
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
        <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={internalButtonDisabledStatus} type={SUBMIT}>
          {btnIcon && <Icon id={btnIcon} />}
          {btnText}
        </Button>
      </div>
    </SatelliteGovernanceAvailableAction>
  )
}

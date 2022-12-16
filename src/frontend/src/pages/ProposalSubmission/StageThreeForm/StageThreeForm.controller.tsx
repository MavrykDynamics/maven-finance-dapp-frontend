import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import { StageThreeFormProps, StageThreeValidityItem } from '../ProposalSybmittion.types'
import { Governance_Proposal } from 'utils/generated/graphqlTypes'

// helpers
import { checkPaymentExists, getValidityStageThreeTable, MAX_ROWS } from '../ProposalSubmition.helpers'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'

// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

// styles
import {
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
  SubmissionStyled,
} from '../ProposalSubmission.style'
import Table, { TableProps } from 'app/App.components/Table/Table.controller'
import { CellType } from 'app/App.components/Table/TableCell'

export const StageThreeForm = ({
  proposalId,
  currentProposal,
  paymentMethods,
  currentProposalValidation,
  updateLocalProposalValidation,
  setProposalHasChange,
  updateLocalProposalData,
}: StageThreeFormProps) => {
  const { proposalPayments, locked, title } = currentProposal
  const {
    governanceStorage: {
      fee,
      config: { successReward, proposalDescriptionMaxLength },
    },
    governancePhase,
  } = useSelector((state: State) => state.governance)

  useEffect(() => {
    if (!proposalPayments.some(checkPaymentExists)) {
      handleAddRow()
    }
  }, [proposalId, proposalPayments])

  const isProposalRound = governancePhase === 'PROPOSAL'
  const isMaxRows = MAX_ROWS <= proposalPayments.length
  const DEFAULT_DROPDOWNS_STATE = useMemo(
    () => Array.from({ length: proposalPayments.length }, () => false),
    [proposalPayments],
  )
  const [openDrop, setOpenDrop] = useState(DEFAULT_DROPDOWNS_STATE)

  const handleOnBlur = (e: React.ChangeEvent<HTMLInputElement>, itemIdx: number, maxLength?: number) => {
    const { name, value } = e.target
    const validationResult = getValidityStageThreeTable(name as StageThreeValidityItem, value, maxLength)
      ? INPUT_STATUS_SUCCESS
      : INPUT_STATUS_ERROR

    updateLocalProposalValidation(
      {
        paymentsValidation: currentProposalValidation.paymentsValidation.map((paymentValidation, idx) =>
          idx === itemIdx ? { ...paymentValidation, [name]: validationResult } : paymentValidation,
        ),
      },
      proposalId,
    )
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string | number } },
    row: number,
  ) => {
    let { name, value } = e.target

    updateLocalProposalData(
      {
        proposalPayments: proposalPayments.map((item, idx) => {
          return idx === row
            ? {
                ...item,
                [name]: value,
              }
            : item
        }),
      },
      proposalId,
    )

    setOpenDrop(DEFAULT_DROPDOWNS_STATE)
    setProposalHasChange(true)
  }

  const handleAddRow = () => {
    const { address = '', id = 0 } = paymentMethods?.[0] ?? {}
    const newId = -(proposalPayments.length + 1)
    updateLocalProposalData(
      {
        proposalPayments: proposalPayments.concat({
          // TODO: check how to remove it
          governance_proposal: currentProposal as unknown as Governance_Proposal,
          governance_proposal_id: 0,
          id: -(proposalPayments.length + 1),
          internal_id: 0,
          title: '',
          to__id: '',
          token_amount: 0,
          token_id: id,
          token_address: address,
        }),
      },
      proposalId,
    )
    updateLocalProposalValidation(
      {
        paymentsValidation: currentProposalValidation.paymentsValidation.concat({
          token_amount: '',
          title: '',
          to__id: '',
          paymentId: newId,
        }),
      },
      proposalId,
    )
    setOpenDrop(DEFAULT_DROPDOWNS_STATE)
    setProposalHasChange(true)
  }

  const handleDeleteRow = (rowIdx: number) => {
    updateLocalProposalData(
      {
        proposalPayments: proposalPayments.filter((_, idx) => idx !== rowIdx),
      },
      proposalId,
    )
    updateLocalProposalValidation(
      {
        paymentsValidation: currentProposalValidation.paymentsValidation.filter((_, idx) => idx !== rowIdx),
      },
      proposalId,
    )
    setOpenDrop(DEFAULT_DROPDOWNS_STATE)
    setProposalHasChange(true)
  }

  const disabledInputs = useMemo(() => !isProposalRound || locked, [isProposalRound, locked])

  const tableData = useMemo(() => {
    return proposalPayments.map<TableProps['data'][number]>((payment, idx) => {
      const validationObj = currentProposalValidation.paymentsValidation?.find(
        ({ paymentId }) => paymentId === payment.id,
      )
      const { symbol: selectedSymbol = 'MVK' } =
        paymentMethods.find(({ address }) => address === payment.token_address) ?? paymentMethods?.[0] ?? {}

      return [
        {
          cellValue: payment.to__id ?? '',
          cellType: (locked ? 'tzAddress' : 'input') as CellType,
          inputProps: {
            inputStatus: validationObj?.to__id,
            onChange: handleChange,
            onBlur: handleOnBlur,
            onFocus: () => setOpenDrop(DEFAULT_DROPDOWNS_STATE),
            name: 'to__id',
            type: 'text',
          },
        },
        {
          cellValue: payment.title ?? '',
          cellType: (locked ? 'text' : 'input') as CellType,
          inputProps: {
            inputStatus: validationObj?.title,
            onChange: handleChange,
            onBlur: handleOnBlur,
            onFocus: () => setOpenDrop(DEFAULT_DROPDOWNS_STATE),
            name: 'title',
            type: 'text',
          },
        },
        {
          cellValue: payment.token_amount ?? 0,
          cellType: (locked ? 'commaNumber' : 'input') as CellType,
          inputProps: {
            inputStatus: validationObj?.token_amount,
            onChange: handleChange,
            onBlur: handleOnBlur,
            onFocus: () => setOpenDrop(DEFAULT_DROPDOWNS_STATE),
            name: 'token_amount',
            type: 'number',
          },
        },
        {
          cellValue: selectedSymbol,
          cellType: (locked ? 'text' : 'dropDown') as CellType,
          dropDownProps: {
            items: paymentMethods.map(({ symbol }) => symbol),
            isOpen: openDrop[idx],
            clickOnDropDown: (rowIdx: number) => () => {},
            clickOnItem: (rowIdx: number) => (value: string) => {},
            setIsOpen: (newState: Array<boolean>) => {},
          },
        },
      ]
    })
  }, [proposalPayments, currentProposalValidation.paymentsValidation, paymentMethods, locked, openDrop])

  return (
    <SubmissionStyled>
      <FormHeaderGroup>
        <h1>Stage 3</h1>
        <StatusFlag
          text={locked ? 'LOCKED' : 'UNLOCKED'}
          status={locked ? ProposalStatus.DEFEATED : ProposalStatus.EXECUTED}
        />
        <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
          <Icon id="question" />
        </a>
      </FormHeaderGroup>
      <FormTitleAndFeeContainer>
        <FormTitleContainer>
          <label>1 - Enter Proposal Title</label>
          <FormTitleEntry>{title}</FormTitleEntry>
        </FormTitleContainer>
        <div>
          <label>2 - Proposal Success Reward</label>
          <FormTitleEntry>{successReward} MVK</FormTitleEntry>
        </div>
        <div>
          <label>3 - Fee</label>
          <FormTitleEntry>{fee} XTZ</FormTitleEntry>
        </div>
      </FormTitleAndFeeContainer>
      <label>4 - Enter Proposal Data</label>
      <Table
        data={tableData}
        className="stage-3-table"
        colunmNames={['Address', 'Purpose', 'Amount', 'Payment Type (XTZ/MVK)']}
        addRowHandler={handleAddRow}
        removeRowHandler={handleDeleteRow}
      />
    </SubmissionStyled>
  )
}

// TODO: old table
{
  /* <FormTableGrid className={!isProposalRound ? 'disabled' : ''}>
        <TableGridWrap>
          <div className="table-wrap">
            <table>
              <tr key="row-names">
                <td key="row-names-address">Address</td>
                <td key="row-names-purpose">Purpose</td>
                <td key="row-names-amount">Amount</td>
                <td key="row-names-asset">Payment Type (XTZ/MVK)</td>
              </tr>
              {proposalPayments.map((rowItems, i) => {
                const validationObj = currentProposalValidation.paymentsValidation?.find(
                  ({ paymentId }) => paymentId === rowItems.id,
                )
                const { symbol: selectedSymbol = 'MVK' } =
                  paymentMethods.find(({ address }) => address === rowItems.token_address) ?? paymentMethods?.[0] ?? {}

                if (!rowItems || rowItems.title === null || rowItems.token_amount === null) return null

                return (
                  <tr key={i}>
                    <td key={`${i}-address`} className="input-cell">
                      <Input
                        onFocus={() => setOpenDrop('')}
                        value={rowItems.to__id ?? ''}
                        type={'text'}
                        name="to__id"
                        disabled={disabledInputs}
                        inputStatus={validationObj?.to__id}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, i)}
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, rowItems.id)}
                        className="submit-proposal-stage-3"
                      />
                    </td>
                    <td key={`${i}-purpose`} className="input-cell">
                      <Input
                        onFocus={() => setOpenDrop('')}
                        value={rowItems.title ?? ''}
                        type={'text'}
                        name="title"
                        disabled={disabledInputs}
                        inputStatus={validationObj?.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, i)}
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleOnBlur(e, rowItems.id, proposalDescriptionMaxLength)
                        }
                        className="submit-proposal-stage-3"
                      />
                    </td>
                    <td key={`${i}-amount`} className="input-cell">
                      <Input
                        onFocus={() => setOpenDrop('')}
                        value={rowItems.token_amount ?? ''}
                        type={'number'}
                        name="token_amount"
                        disabled={disabledInputs}
                        inputStatus={validationObj?.token_amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, i)}
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, rowItems.id)}
                        className="submit-proposal-stage-3"
                      />
                    </td>
                    <td key={`${i}-asset`}>
                      <div className="table-drop">
                        <button
                          onClick={() => handleToggleDrop(i)}
                          disabled={locked || !isProposalRound}
                          className="table-drop-btn-cur"
                        >
                          {selectedSymbol}
                        </button>
                        {openDrop === `${i}-asset` && (
                          <DropDownListContainer>
                            <DropDownList>
                              {paymentMethods.map(({ symbol, address }) => (
                                <DropDownListItem
                                  onClick={() =>
                                    handleChange(
                                      {
                                        target: { name: 'token_address', value: address },
                                      },
                                      i,
                                    )
                                  }
                                  key={symbol}
                                >
                                  {symbol} {selectedSymbol === symbol ? <Icon id="check-stroke" /> : null}
                                </DropDownListItem>
                              ))}
                            </DropDownList>
                          </DropDownListContainer>
                        )}
                      </div>

                      <div className="delete-button-wrap">
                        <CustomTooltip text="Delete row">
                          <button onClick={() => handleDeleteRow(rowItems.id)} disabled={locked || !isProposalRound}>
                            <Icon id="delete" />
                          </button>
                        </CustomTooltip>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </table>
          </div>
          {!isMaxRows ? (
            <CustomTooltip text="Insert 1 row below" className="btn-add-row">
              <button disabled={locked || !isProposalRound} onClick={handleAddRow}>
                +
              </button>
            </CustomTooltip>
          ) : null}
        </TableGridWrap>
      </FormTableGrid> */
}

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

  const isTableDisabled = useMemo(() => !isProposalRound || locked, [isProposalRound, locked])

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
            disabled: isTableDisabled,
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
            disabled: isTableDisabled,
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
            disabled: isTableDisabled,
            onFocus: () => setOpenDrop(DEFAULT_DROPDOWNS_STATE),
            name: 'token_amount',
            type: 'number',
          },
          commaNumberProps: {
            endingText: selectedSymbol,
          },
        },
        {
          cellValue: selectedSymbol,
          cellType: (locked ? 'text' : 'dropDown') as CellType,
          dropDownProps: {
            items: paymentMethods.map(({ symbol }) => symbol),
            isOpen: openDrop[idx],
            disabled: isTableDisabled,
            clickOnItem: (rowIdx: number) => (newSelectedSymbol: string) => {
              const address = paymentMethods.find(({ symbol }) => newSelectedSymbol === symbol)?.address

              if (address) {
                handleChange(
                  {
                    target: { name: 'token_address', value: address },
                  },
                  rowIdx,
                )
              }
            },
            setIsOpen: (newState: Array<boolean>) => setOpenDrop(newState),
          },
        },
      ]
    })
  }, [
    proposalPayments,
    currentProposalValidation.paymentsValidation,
    paymentMethods,
    locked,
    isTableDisabled,
    openDrop,
  ])

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
        isTableDisabled={isTableDisabled}
        className="stage-3-table"
        colunmNames={['Address', 'Purpose', 'Amount', 'Payment Type (XTZ/MVK)']}
        addRowHandler={handleAddRow}
        removeRowHandler={handleDeleteRow}
      />
    </SubmissionStyled>
  )
}

import React, { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import { StageThreeFormProps, StageThreeValidityItem } from '../ProposalSybmittion.types'
import { Governance_Proposal } from 'utils/generated/graphqlTypes'

// helpers
import { checkPaymentExists, getValidityStageThreeTable } from '../ProposalSubmition.helpers'

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
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { Input } from 'app/App.components/Input/Input.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'
import { DropDownJsxChild } from 'pages/Loans/Components/Modals/Modals.style'

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

  const { fee, successReward, governancePhase } = useSelector((state: State) => state.governanceConfig)

  useEffect(() => {
    if (!proposalPayments.some(checkPaymentExists)) {
      handleAddRow()
    }
  }, [proposalId, proposalPayments])

  const ddItems = useMemo(() => {
    return paymentMethods.map((method) => ({
      content: <DropDownJsxChild>{method.symbol}</DropDownJsxChild>,
      id: method.address,
    }))
  }, [paymentMethods])

  const isProposalRound = governancePhase === 'PROPOSAL'

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

    setProposalHasChange(true)
  }

  const handleAddRow = () => {
    const { address = '', id = 0 } = paymentMethods?.[0] ?? {}
    const newId = -(proposalPayments.length + 1)
    updateLocalProposalData(
      {
        proposalPayments: (proposalPayments ?? []).concat({
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
        paymentsValidation: (currentProposalValidation.paymentsValidation ?? []).concat({
          token_amount: '',
          title: '',
          to__id: '',
          paymentId: newId,
        }),
      },
      proposalId,
    )
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
    setProposalHasChange(true)
  }

  const isTableDisabled = useMemo(() => !isProposalRound || locked, [isProposalRound, locked])

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
      <Table className="editable-table with-header">
        <TableHeader className="editable-head">
          <TableRow>
            <TableHeaderCell className="no-right-border">Address</TableHeaderCell>
            <TableHeaderCell>Purpose</TableHeaderCell>
            <TableHeaderCell>Amount</TableHeaderCell>
            <TableHeaderCell className="right-border">Payment Type (XTZ/MVK)</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody className="editable-body">
          {proposalPayments.map((payment, rowIdx) => {
            const validationObj = currentProposalValidation.paymentsValidation?.find(
              ({ paymentId }) => paymentId === payment.id,
            )
            const { symbol: selectedSymbol = 'MVK', address } =
              paymentMethods.find(({ address }) => address === payment.token_address) ?? paymentMethods?.[0] ?? {}

            return (
              <TableRow className="editable-row">
                <TableCell width="25%">
                  {isTableDisabled ? (
                    payment.to__id ? (
                      <TzAddress
                        tzAddress={String(payment.to__id)}
                        type={BLUE}
                        hasIcon={true}
                        className="table-cell-tzAddress"
                      />
                    ) : (
                      ''
                    )
                  ) : (
                    <Input
                      value={String(payment.to__id)}
                      inputStatus={validationObj?.to__id}
                      onChange={(e) => handleChange(e, rowIdx)}
                      onBlur={(e) => handleOnBlur(e, rowIdx)}
                      name={'to__id'}
                      type={'text'}
                    />
                  )}
                </TableCell>
                <TableCell width="25%">
                  {isTableDisabled ? (
                    String(payment.title)
                  ) : (
                    <Input
                      value={String(payment.title)}
                      inputStatus={validationObj?.title}
                      onChange={(e) => handleChange(e, rowIdx)}
                      onBlur={(e) => handleOnBlur(e, rowIdx)}
                      name={'title'}
                      type={'text'}
                    />
                  )}
                </TableCell>
                <TableCell width="25%">
                  {isTableDisabled ? (
                    <CommaNumber value={Number(payment.token_amount)} endingText={selectedSymbol} />
                  ) : (
                    <Input
                      value={String(payment.token_amount)}
                      inputStatus={validationObj?.token_amount}
                      onChange={(e) => handleChange(e, rowIdx)}
                      onBlur={(e) => handleOnBlur(e, rowIdx)}
                      name={'token_amount'}
                      type={'number'}
                    />
                  )}
                </TableCell>
                <TableCell className="no-right-border" width="25%">
                  {isTableDisabled ? (
                    selectedSymbol
                  ) : (
                    <DropDown
                      placeholder={'Select paymeth method'}
                      className="stage-3-dropDown"
                      items={ddItems}
                      activeItem={ddItems.find(({ id }) => address === id) ?? ddItems[0]}
                      clickItem={(newSelectedAddress: DDItemId) => {
                        handleChange(
                          {
                            target: { name: 'token_address', value: newSelectedAddress },
                          },
                          rowIdx,
                        )
                      }}
                    />
                  )}
                </TableCell>

                <RemoveRowBtn
                  className={`button-wrap remove ${isTableDisabled ? 'disabled' : ''}`}
                  {...(!isTableDisabled ? { onClick: () => handleDeleteRow(rowIdx) } : {})}
                >
                  <CustomTooltip text="Delete row">
                    <Icon id="delete" />
                  </CustomTooltip>
                </RemoveRowBtn>
              </TableRow>
            )
          })}
        </TableBody>
        <AddRowBtn
          className={`button-wrap ${isTableDisabled ? 'disabled' : ''}`}
          {...(!isTableDisabled ? { onClick: handleAddRow } : {})}
        >
          <CustomTooltip text="Insert 1 row below">
            <span>+</span>
          </CustomTooltip>
        </AddRowBtn>
      </Table>
    </SubmissionStyled>
  )
}

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
  SubmitProposalGeneralData,
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
  updateLocalProposalData,
}: StageThreeFormProps) => {
  const { proposalPayments, locked, title } = currentProposal

  const { fee, successReward, governancePhase } = useSelector((state: State) => state.governance.config)

  const isProposalRound = governancePhase === 'PROPOSAL'

  // is no bytes payments on proposal change add empty pair on client
  useEffect(() => {
    if (!proposalPayments.some(checkPaymentExists)) {
      handleAddRow()
    }
  }, [proposalId])

  const ddItems = useMemo(() => {
    return paymentMethods.map((method) => ({
      content: <DropDownJsxChild>{method.symbol}</DropDownJsxChild>,
      id: method.address,
    }))
  }, [paymentMethods])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string | number } },
    row: number,
    maxLength?: number,
  ) => {
    let { name, value } = e.target

    // update input value
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

    // we don't need validation for token address, cuz it's not used on backend, and it's dd value
    if (name !== 'token_address') {
      // update validation
      const validationResult = getValidityStageThreeTable(name as StageThreeValidityItem, value, maxLength)
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR

      updateLocalProposalValidation(
        {
          paymentsValidation: currentProposalValidation.paymentsValidation.map((paymentValidation, idx) =>
            idx === row ? { ...paymentValidation, [name]: validationResult } : paymentValidation,
          ),
        },
        proposalId,
      )
    }
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
  }

  const isTableDisabled = useMemo(() => !isProposalRound || locked, [isProposalRound, locked])

  return (
    <>
      <SubmitProposalGeneralData>
        <div className="submitted-data">
          <div className="label">1 - Proposal Title</div>
          <div className="value">{title}</div>
        </div>

        <div className="submitted-data">
          <div className="label">2 - Proposal Success Reward</div>
          <CommaNumber className="value" value={successReward} endingText="MVK" />
        </div>

        <div className="submitted-data">
          <div className="label">3 - Fee</div>
          <CommaNumber className="value" value={fee} endingText="XTZ" />
        </div>
      </SubmitProposalGeneralData>

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
    </>
  )
}

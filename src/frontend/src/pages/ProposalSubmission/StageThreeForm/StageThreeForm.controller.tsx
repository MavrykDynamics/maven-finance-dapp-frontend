import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import { StageThreeFormProps, StageThreeValidityItem } from '../ProposalSubmission.types'

// helpers
import { getValidityStageThreeTable } from '../ProposalSubmission.helpers'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import Button from 'app/App.components/Button/NewButton'

// const
import { INPUT_SMALL, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { BUTTON_SIMPLE_SMALL } from 'app/App.components/Button/Button.constants'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { STAGE_3_DESCRIPTION } from 'texts/tooltips/governance'

// styles
import { SubmitProposalGeneralData } from '../ProposalSubmission.style'
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
import { DropDownJsxChild } from 'app/App.components/DropDown/DropDown.style'

export const StageThreeForm = ({
  proposalId,
  currentProposal,
  currentProposalValidation,
  updateLocalProposalValidation,
  updateLocalProposalData,
}: StageThreeFormProps) => {
  const { proposalPayments, locked, title } = currentProposal

  const { fee, successReward, governancePhase, proposalMetadataTitleMaxLength } = useSelector(
    (state: State) => state.governance.config,
  )
  const { treasuryTokens } = useSelector((state: State) => state.treasury)

  const isProposalRound = governancePhase === 'PROPOSAL'

  const ddItems = useMemo(() => {
    return Object.keys(treasuryTokens).map((tokenAddress) => ({
      content: <DropDownJsxChild>{treasuryTokens[tokenAddress].name}</DropDownJsxChild>,
      id: tokenAddress,
    }))
  }, [treasuryTokens])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string | number } },
    row: number,
    options?: { tokenBalance?: number; maxLength?: number },
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
      const validationResult = getValidityStageThreeTable(name as StageThreeValidityItem, value, options)
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
    const paymentToken = Object.values(treasuryTokens)?.[0] ?? null

    if (!paymentToken) return

    const newId = -(proposalPayments.length + 1)
    updateLocalProposalData(
      {
        proposalPayments: (proposalPayments ?? []).concat({
          id: -(proposalPayments.length + 1),
          internal_id: 0,
          title: '',
          to__id: '',
          token_amount: 0,
          // TODO: implement token id's when it's fixed on backend
          token_id: 0,
          token_address: paymentToken.tokenAddress,
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
      <div className="stage-descr">{STAGE_3_DESCRIPTION}</div>

      <SubmitProposalGeneralData>
        <div className="submitted-data">
          <div className="label">1 - Proposal Title</div>
          <div className="value">{title || '–'}</div>
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

      <div className="payments-table">
        <div className="label">4 - Enter Proposal Payment Data</div>
        <Table className="editable-table with-header">
          <TableHeader className="editable-head">
            <TableRow>
              <TableHeaderCell
                style={
                  proposalPayments.length === 0
                    ? {
                        borderBottomLeftRadius: '10px',
                      }
                    : undefined
                }
              >
                Address
              </TableHeaderCell>
              <TableHeaderCell>Purpose</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell
                style={
                  proposalPayments.length === 0
                    ? {
                        borderBottomRightRadius: '10px',
                      }
                    : undefined
                }
              >
                Payment Type
              </TableHeaderCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {proposalPayments.length ? (
              proposalPayments.map((payment, rowIdx) => {
                const validationObj = currentProposalValidation.paymentsValidation?.find(
                  ({ paymentId }) => paymentId === payment.id,
                )

                if (payment.to__id === null || payment.title === null || !payment.token_address) return null

                const token = treasuryTokens[payment.token_address]

                if (!token) return null

                const { name, tokenAddress, balance } = token

                return (
                  <TableRow className="editable-row" key={payment.id}>
                    <TableCell width="25%" className="hide-overflow tz-address-cell-center">
                      {isTableDisabled ? (
                        payment.to__id ? (
                          <TzAddress tzAddress={String(payment.to__id)} type={BLUE} hasIcon />
                        ) : (
                          '-'
                        )
                      ) : (
                        <Input
                          settings={{
                            inputStatus: validationObj?.to__id,
                            inputSize: INPUT_SMALL,
                          }}
                          inputProps={{
                            placeholder: 'Enter Receiver Address',
                            value: String(payment.to__id),
                            type: 'text',
                            name: 'to__id',
                            onChange: (e) => handleChange(e, rowIdx),
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell width="25%" className="hide-overflow">
                      {isTableDisabled ? (
                        String(payment.title)
                      ) : (
                        <Input
                          settings={{
                            inputStatus: validationObj?.title,
                            inputSize: INPUT_SMALL,
                          }}
                          inputProps={{
                            placeholder: 'Enter Payment Purpose',
                            value: String(payment.title),
                            type: 'text',
                            name: 'title',
                            onChange: (e) => handleChange(e, rowIdx, { maxLength: proposalMetadataTitleMaxLength }),
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell width="25%" className="hide-overflow">
                      {isTableDisabled ? (
                        <CommaNumber value={Number(payment.token_amount)} endingText={name} />
                      ) : (
                        <Input
                          settings={{
                            inputStatus: validationObj?.token_amount,
                            inputSize: INPUT_SMALL,
                          }}
                          inputProps={{
                            placeholder: 'Enter Tokens Amount',
                            value: String(payment.token_amount),
                            type: 'number',
                            name: 'token_amount',
                            onChange: (e) => handleChange(e, rowIdx, { tokenBalance: balance }),
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell width="25%">
                      {isTableDisabled ? (
                        name
                      ) : (
                        <DropDown
                          placeholder={'Select payment method'}
                          className="stage-3-dropDown"
                          items={ddItems}
                          activeItem={ddItems.find(({ id }) => tokenAddress === id)}
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

                    <RemoveRowBtn>
                      <CustomTooltip text="Delete row" className="tooltip">
                        <Button
                          kind={BUTTON_SIMPLE_SMALL}
                          onClick={() => handleDeleteRow(rowIdx)}
                          disabled={isTableDisabled}
                        >
                          <Icon id="delete" />
                        </Button>
                      </CustomTooltip>
                    </RemoveRowBtn>
                  </TableRow>
                )
              })
            ) : (
              <>
                <TableRow className="plug-row" rowHeight={43}>
                  <TableCell width="25%" />
                  <TableCell width="25%" />
                  <TableCell width="25%" />
                  <TableCell width="25%" />
                  <div className="plug-row-text">
                    {locked ? 'Proposal is locked without payments' : 'Add payments to your proposal'}
                  </div>
                </TableRow>
              </>
            )}
          </TableBody>
          <AddRowBtn>
            <CustomTooltip text="Insert 1 row below" className="tooltip">
              <Button kind={BUTTON_SIMPLE_SMALL} onClick={handleAddRow} disabled={isTableDisabled}>
                <Icon id="plus" />
              </Button>
            </CustomTooltip>
          </AddRowBtn>
        </Table>
      </div>
    </>
  )
}

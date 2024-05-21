import React, { useMemo } from 'react'

// context
import { useProposalsContext } from 'providers/ProposalsProvider/proposals.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useTreasuryContext } from 'providers/TreasuryProvider/treasury.provider'

// types
import { StageThreeFormProps, StageThreeValidityItem, ValidationResult } from '../ProposalSubmission.types'

// helpers
import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getValidityStageThreeTable } from '../helpers/proposalSubmissionValidation.utils'
import { reduceTreasuryAssets } from 'providers/TreasuryProvider/helpers/treasury.utils'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { DDItemId, DropDown, DropDownItemType } from 'app/App.components/DropDown/NewDropdown'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import { ProposalSubmissionBanner } from '../ProposalSubmissionBanner/ProposalSubmissionBanner'
import Button from 'app/App.components/Button/NewButton'

// const
import { INPUT_SMALL, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { BUTTON_SIMPLE_SMALL } from 'app/App.components/Button/Button.constants'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import { STAGE_3_DESCRIPTION } from 'texts/tooltips/governance'
import { GovPhases } from 'providers/ProposalsProvider/helpers/proposals.const'

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
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

// NOTE: isLoading is handled in <ProposalSubmission.controller>
export const StageThreeForm = ({
  proposalId,
  currentProposal,
  currentProposalValidation,
  isFormDisabled,
  updateLocalProposalValidation,
  updateLocalProposalData,
}: StageThreeFormProps) => {
  const { proposalPayments, locked, title } = currentProposal

  const { tokensMetadata } = useTokensContext()
  const {
    maxLengths: {
      governance: { proposalMetadataTitleMaxLength },
    },
  } = useDappConfigContext()
  const {
    config: { governancePhase, fee, successReward },
  } = useProposalsContext()
  const { treasuryAddresses, treasuryMapper } = useTreasuryContext()

  const treasuryTokens = useMemo(
    () => reduceTreasuryAssets(treasuryAddresses, treasuryMapper),
    [treasuryAddresses, treasuryMapper],
  )

  const isProposalRound = governancePhase === GovPhases.PROPOSAL || governancePhase === GovPhases.EXECUTION

  const allowedTokensForDD = useMemo(() => {
    return Object.keys(treasuryTokens).reduce<Array<DropDownItemType>>((acc, tokenAddress) => {
      const allowedToken = getTokenDataByAddress({ tokenAddress, tokensMetadata })

      if (!allowedToken) return acc

      acc.push({
        content: <DropDownJsxChild>{allowedToken.symbol}</DropDownJsxChild>,
        id: tokenAddress,
      })

      return acc
    }, [])
  }, [tokensMetadata, treasuryTokens])

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

    // update validation
    let validationResult: ValidationResult = INPUT_STATUS_ERROR
    // if we changed token, we need to revalidate token amount
    if (name === 'token_address') {
      validationResult = getValidityStageThreeTable('token_amount', proposalPayments[row]?.token_amount ?? 0, options)
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR

      updateLocalProposalValidation(
        {
          paymentsValidation: currentProposalValidation.paymentsValidation.map((paymentValidation, idx) =>
            idx === row ? { ...paymentValidation, token_amount: validationResult } : paymentValidation,
          ),
        },
        proposalId,
      )
    } else {
      validationResult = getValidityStageThreeTable(name as StageThreeValidityItem, value, options)
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
    const paymentToken = Object.keys(treasuryTokens)?.[0] ?? null

    if (!paymentToken) return

    const newId = -(proposalPayments.length + 1)
    updateLocalProposalData(
      {
        proposalPayments: (proposalPayments ?? []).concat({
          id: -(proposalPayments.length + 1),
          title: '',
          to__id: '',
          token_amount: 0,
          // TODO: implement token id's when it's fixed on backend
          token_id: 0,
          token_address: paymentToken,
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

  const isTableDisabled = useMemo(
    () => !isProposalRound || locked || !Object.keys(treasuryTokens)?.[0],
    [isProposalRound, locked, treasuryTokens],
  )

  return (
    <>
      <div className="stage-descr">{STAGE_3_DESCRIPTION}</div>

      <ProposalSubmissionBanner />

      <SubmitProposalGeneralData>
        <div className="submitted-data">
          <div className="label">1 - Proposal Title</div>
          <div className="value">{title || '–'}</div>
        </div>

        <div className="submitted-data">
          <div className="label">2 - Proposal Success Reward</div>
          <CommaNumber className="value" value={successReward} endingText="MVN" />
        </div>

        <div className="submitted-data">
          <div className="label">3 - Fee</div>
          <CommaNumber className="value" value={fee} endingText="MVRK" />
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

                const tokenAddress = payment.token_address

                const allowedToken = getTokenDataByAddress({ tokenAddress, tokensMetadata })
                const tokenBalance = treasuryTokens[tokenAddress].balance

                if (!tokenBalance || !tokenAddress || !allowedToken) return null

                const { symbol, decimals } = allowedToken

                const maxAmount = convertNumberForClient({
                  number: tokenBalance,
                  grade: decimals,
                })

                // if value is from indexer convert it to client format othervise, it's user enter, and show as it is
                const tokenAmount =
                  validationObj?.token_amount === ''
                    ? convertNumberForClient({
                        number: payment.token_amount ?? 0,
                        grade: decimals,
                      })
                    : payment.token_amount ?? 0

                return (
                  <TableRow className="editable-row" key={payment.id}>
                    <TableCell $width="25%" className="hide-overflow tz-address-cell-center">
                      {isTableDisabled ? (
                        payment.to__id ? (
                          <TzAddress tzAddress={String(payment.to__id)} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
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
                            disabled: isFormDisabled,
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell $width="25%" className="hide-overflow">
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
                            disabled: isFormDisabled,
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell $width="25%" className="hide-overflow">
                      {isTableDisabled ? (
                        <CommaNumber value={tokenAmount} endingText={symbol} />
                      ) : (
                        <Input
                          settings={{
                            inputStatus: validationObj?.token_amount,
                            inputSize: INPUT_SMALL,
                          }}
                          inputProps={{
                            placeholder: 'Enter Tokens Amount',
                            value: tokenAmount,
                            type: 'number',
                            name: 'token_amount',
                            onChange: (e) => handleChange(e, rowIdx, { tokenBalance: maxAmount }),
                          }}
                        />
                      )}
                    </TableCell>

                    <TableCell $width="25%">
                      {isTableDisabled ? (
                        symbol
                      ) : (
                        <DropDown
                          placeholder={'Select payment method'}
                          className="stage-3-dropDown"
                          items={allowedTokensForDD}
                          activeItem={allowedTokensForDD.find(({ id }) => tokenAddress === id)}
                          clickItem={(newSelectedAddress: DDItemId) => {
                            if (!newSelectedAddress || typeof newSelectedAddress !== 'string') return

                            const newSelectedToken = getTokenDataByAddress({
                              tokenAddress: newSelectedAddress,
                              tokensMetadata,
                            })
                            const newSelectedTokenBalance = treasuryTokens[newSelectedAddress].balance

                            if (!newSelectedToken || !newSelectedTokenBalance) return

                            handleChange(
                              {
                                target: {
                                  name: 'token_address',
                                  value: newSelectedAddress,
                                },
                              },
                              rowIdx,
                              {
                                tokenBalance: convertNumberForClient({
                                  number: newSelectedTokenBalance,
                                  grade: newSelectedToken.decimals,
                                }),
                              },
                            )
                          }}
                        />
                      )}
                    </TableCell>

                    <RemoveRowBtn>
                      <Tooltip>
                        <Tooltip.Trigger>
                          <Button
                            kind={BUTTON_SIMPLE_SMALL}
                            onClick={() => handleDeleteRow(rowIdx)}
                            disabled={isTableDisabled}
                          >
                            <Icon id="delete" />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>Delete row</Tooltip.Content>
                      </Tooltip>
                    </RemoveRowBtn>
                  </TableRow>
                )
              })
            ) : (
              <>
                <TableRow className="plug-row" $rowHeight={43}>
                  <TableCell $width="25%" />
                  <TableCell $width="25%" />
                  <TableCell $width="25%" />
                  <TableCell $width="25%" />
                  <div className="plug-row-text">
                    {locked ? 'Proposal is locked without payments' : 'Add payments to your proposal'}
                  </div>
                </TableRow>
              </>
            )}
          </TableBody>
          <AddRowBtn>
            <Tooltip>
              <Tooltip.Trigger>
                <Button kind={BUTTON_SIMPLE_SMALL} onClick={handleAddRow} disabled={isTableDisabled}>
                  <Icon id="plus" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Insert 1 row below</Tooltip.Content>
            </Tooltip>
          </AddRowBtn>
        </Table>
      </div>
    </>
  )
}

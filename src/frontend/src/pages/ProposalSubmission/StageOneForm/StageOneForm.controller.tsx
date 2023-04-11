import { useSelector } from 'react-redux'
import React from 'react'
import { State } from 'reducers'

// view
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { TextArea } from 'app/App.components/TextArea/TextArea.controller'
import {
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
} from '../ProposalSubmission.style'
import { Input } from 'app/App.components/Input/Input.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// types
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { StageOneFormProps, ValidationResult } from '../ProposalSybmittion.types'

// helpers, constants
import { isValidLength, isValidHttpUrl } from '../../../utils/validatorFunctions'
import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

// TODO: Update markup

export const StageOneForm = ({
  proposalId,
  currentProposal,
  currentProposalValidation,
  updateLocalProposalValidation,
  updateLocalProposalData,
}: StageOneFormProps) => {
  const {
    fee,
    successReward,
    proposalTitleMaxLength,
    proposalDescriptionMaxLength,
    proposalSourceCodeMaxLength,
    governancePhase,
  } = useSelector((state: State) => state.governance.config)

  const isProposalRound = governancePhase === 'PROPOSAL'
  const isProposalSubmitted = proposalId >= 0
  const disabled = !isProposalRound || isProposalSubmitted

  // update local state value and parent state due to inputted info
  const inputHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    updateLocalProposalData(
      {
        [name]: value,
      },
      proposalId,
    )

    switch (name) {
      case 'title':
        updateLocalProposalValidation(
          {
            title: isValidLength(currentProposal.title, 1, proposalTitleMaxLength)
              ? INPUT_STATUS_SUCCESS
              : INPUT_STATUS_ERROR,
          },
          proposalId,
        )
        break
      case 'description':
        updateLocalProposalValidation(
          {
            description: isValidLength(currentProposal.description, 1, proposalDescriptionMaxLength)
              ? INPUT_STATUS_SUCCESS
              : INPUT_STATUS_ERROR,
          },
          proposalId,
        )
        break

      case 'sourceCode':
        updateLocalProposalValidation(
          {
            sourceCode:
              isValidHttpUrl(currentProposal.sourceCode) &&
              isValidLength(currentProposal.sourceCode, 1, proposalSourceCodeMaxLength)
                ? INPUT_STATUS_SUCCESS
                : INPUT_STATUS_ERROR,
          },
          proposalId,
        )
        break
      // TODO: remove if no need
      // case 'SUCCESS_MVK_REWARD':
      //   updateLocalProposalValidation(
      //     {
      //       successMVKReward: currentProposal.successReward >= 0 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
      //     },
      //     proposalId,
      //   )
      //   break
      // case 'IPFS':
      //   updateLocalProposalValidation(
      //     {
      //       ipfs: Boolean(e) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
      //     },
      //     proposalId,
      //   )
      //   break
    }
  }

  return (
    <>
      <FormHeaderGroup>
        <h1>Stage 1 </h1>
        <StatusFlag
          text={currentProposal.locked ? ProposalStatus.LOCKED : ProposalStatus.UNLOCKED}
          status={currentProposal.locked ? ProposalStatus.DEFEATED : ProposalStatus.EXECUTED}
        />
        <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
          <Icon id="question" />
        </a>
      </FormHeaderGroup>
      <FormTitleAndFeeContainer>
        <FormTitleContainer>
          {isProposalSubmitted ? (
            <div>
              <label>1 - Proposal Title</label>
              <FormTitleEntry>{currentProposal.title}</FormTitleEntry>
            </div>
          ) : (
            <>
              <label>1 - Enter Proposal Title</label>
              <Input
                type="text"
                name="title"
                value={currentProposal.title}
                onChange={inputHandler}
                inputStatus={currentProposalValidation.title}
                disabled={disabled}
              />
            </>
          )}
        </FormTitleContainer>
        <div>
          <label>2 - Proposal Success Reward</label>
          <FormTitleEntry>
            <CommaNumber value={successReward} endingText="MVK" />
          </FormTitleEntry>
        </div>
        <div>
          <label>3 - Fee</label>
          <FormTitleEntry>
            <CommaNumber value={fee} endingText="XTZ" />
          </FormTitleEntry>
        </div>
      </FormTitleAndFeeContainer>
      {isProposalSubmitted ? (
        <div className="desr-block">
          <label>4 - Proposal Description</label>
          <FormTitleEntry>{currentProposal.description}</FormTitleEntry>
        </div>
      ) : (
        <>
          <label>4 - Enter a description</label>
          <TextArea
            className="description-textarea"
            name="description"
            value={currentProposal.description}
            onChange={inputHandler}
            inputStatus={currentProposalValidation.description}
            disabled={disabled}
            textAreaMaxLimit={proposalDescriptionMaxLength}
          />
        </>
      )}

      {isProposalSubmitted ? (
        <div className="desr-block">
          <label>5 - Proposal source code</label>
          <FormTitleEntry>
            <a href={currentProposal.sourceCode}>{currentProposal.sourceCode}</a>
          </FormTitleEntry>
        </div>
      ) : (
        <div className="source-code-input-wrap">
          <label>5 - Please add a link to the source code changes</label>
          <Input
            type="text"
            value={currentProposal.sourceCode}
            name="sourceCode"
            onChange={inputHandler}
            inputStatus={currentProposalValidation.sourceCode}
            disabled={disabled}
          />
        </div>
      )}
    </>
  )
}

import { useSelector } from 'react-redux'
import React from 'react'

// view
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { TextArea } from 'app/App.components/TextArea/TextArea.controller'
import { ProposalSubmittionStageOneBody, SubmitProposalHeader } from '../ProposalSubmission.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// types
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { StageOneFormProps } from '../ProposalSubmittion.types'
import { State } from 'reducers'

// helpers, constants
import { isValidLength, isValidHttpUrl } from '../../../utils/validatorFunctions'
import { INPUT_SMALL, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

export const StageOneForm = ({
  proposalId,
  currentProposal,
  currentProposalValidation,
  updateLocalProposalValidation,
  updateLocalProposalData,
}: StageOneFormProps) => {
  const { fee, successReward, proposalTitleMaxLength, proposalDescriptionMaxLength, proposalSourceCodeMaxLength } =
    useSelector((state: State) => state.governance.config)

  const isProposalSubmitted = proposalId >= 0

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
            title: isValidLength(value, 1, proposalTitleMaxLength) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
          },
          proposalId,
        )
        break
      case 'description':
        updateLocalProposalValidation(
          {
            description: isValidLength(value, 1, proposalDescriptionMaxLength)
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
              isValidHttpUrl(value) && isValidLength(value, 1, proposalSourceCodeMaxLength)
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
    <ProposalSubmittionStageOneBody>
      {isProposalSubmitted ? (
        <div className="submitted-data">
          <div className="label">1 - Proposal Title</div>
          <div className="value">{currentProposal.title}</div>
        </div>
      ) : (
        <Input
          settings={{
            label: '1 - Enter Proposal Title',
            inputStatus: currentProposalValidation.title,
            inputSize: INPUT_SMALL,
          }}
          inputProps={{
            disabled: isProposalSubmitted,
            value: currentProposal.title,
            type: 'text',
            placeholder: 'Proposal Title',
            name: 'title',
            onChange: inputHandler,
          }}
        />
      )}

      <div className="submitted-data">
        <div className="label">2 - Proposal Success Reward</div>
        <CommaNumber className="value" value={successReward} endingText="MVK" />
      </div>

      <div className="submitted-data">
        <div className="label">3 - Fee</div>
        <CommaNumber className="value" value={fee} endingText="XTZ" />
      </div>

      {isProposalSubmitted ? (
        <div className="submitted-data description">
          <div className="label">4 - Proposal Description</div>
          <div className="value">{currentProposal.description}</div>
        </div>
      ) : (
        <TextArea
          className="description"
          name="description"
          label="4 - Enter a description"
          placeholder="Descriprion of the proposal"
          value={currentProposal.description}
          onChange={inputHandler}
          inputStatus={currentProposalValidation.description}
          disabled={isProposalSubmitted}
          textAreaMaxLimit={proposalDescriptionMaxLength}
        />
      )}

      {isProposalSubmitted ? (
        <div className="submitted-data source-code">
          <div className="label">5 - Proposal source code</div>
          <a className="isCyan" href={currentProposal.sourceCode}>
            {currentProposal.sourceCode}
          </a>
        </div>
      ) : (
        <Input
          settings={{
            label: '5 - Please add a link to the source code changes',
            inputStatus: currentProposalValidation.sourceCode,
            inputSize: INPUT_SMALL,
          }}
          inputProps={{
            disabled: isProposalSubmitted,
            value: currentProposal.sourceCode,
            type: 'text',
            placeholder: 'Source code link',
            name: 'sourceCode',
            onChange: inputHandler,
          }}
        />
      )}
    </ProposalSubmittionStageOneBody>
  )
}

import { useSelector } from 'react-redux'
import React from 'react'

// view
import { TextArea } from 'app/App.components/TextArea/TextArea.controller'
import { ProposalSubmittionStageOneBody } from '../ProposalSubmission.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import { IPFSUploader } from 'app/App.components/IPFSUploader/IPFSUploader.controller'

// types
import { StageOneFormProps } from '../ProposalSubmission.types'
import { State } from 'reducers'

// helpers, constants
import { isValidLength, isValidHttpUrl } from '../../../utils/validatorFunctions'
import { INPUT_SMALL, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { STAGE_1_DESCRIPTION } from 'texts/tooltips/governance'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { containSpaces } from 'app/App.utils/input'
import { ProposalSubmissionBanner } from '../ProposalSubmissionBanner/ProposalSubmissionBanner'

export const StageOneForm = ({
  proposalId,
  currentProposal,
  currentProposalValidation,
  isFormDisabled,
  updateLocalProposalValidation,
  updateLocalProposalData,
}: StageOneFormProps) => {
  const {
    maxLengths: {
      governance: { proposalTitleMaxLength, proposalDescriptionMaxLength, proposalSourceCodeMaxLength },
    },
  } = useDappConfigContext()

  const { fee, successReward, governancePhase } = useSelector((state: State) => state.governance.config)

  const isProposalSubmitted = proposalId >= 0
  const isProposalPeriod = governancePhase === 'PROPOSAL'

  function handleOnBlur<G extends HTMLInputElement | HTMLTextAreaElement>(e: React.FocusEvent<G>) {
    if (containSpaces(e.target.value)) {
      const trimmedValue = e.target.value.trim()
      updateLocalProposalData({ [e.target.name]: trimmedValue }, proposalId)
    }
  }

  // update local state value and parent state due to inputted info
  const inputHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } },
  ) => {
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
      case 'invoice':
        updateLocalProposalValidation(
          {
            invoice: isValidHttpUrl(value) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
          },
          proposalId,
        )
        break
    }
  }

  return (
    <>
      <div className="stage-descr">{STAGE_1_DESCRIPTION}</div>

      <ProposalSubmissionBanner />

      <ProposalSubmittionStageOneBody isProposalSubmitted={isProposalSubmitted}>
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
              disabled: isProposalSubmitted || !isProposalPeriod || isFormDisabled,
              value: currentProposal.title,
              type: 'text',
              placeholder: 'Proposal Title',
              name: 'title',
              onChange: inputHandler,
              onBlur: handleOnBlur,
            }}
          />
        )}

        <div className="submitted-data vert-center">
          <div className="label">2 - Proposal Success Reward</div>
          <CommaNumber className="value" value={successReward} endingText="MVK" />
        </div>

        <div className="submitted-data vert-center">
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
            onBlur={handleOnBlur}
            inputStatus={currentProposalValidation.description}
            disabled={isProposalSubmitted || !isProposalPeriod || isFormDisabled}
            textAreaMaxLimit={proposalDescriptionMaxLength}
          />
        )}

        {isProposalSubmitted ? (
          <div className="submitted-data source-code">
            <div className="label">5 - Proposal source code</div>
            <a href={currentProposal.sourceCode}>{currentProposal.sourceCode}</a>
          </div>
        ) : (
          <Input
            settings={{
              label: '5 - Please add a link to the source code changes',
              inputStatus: currentProposalValidation.sourceCode,
              inputSize: INPUT_SMALL,
            }}
            inputProps={{
              disabled: isProposalSubmitted || !isProposalPeriod || isFormDisabled,
              value: currentProposal.sourceCode,
              type: 'text',
              placeholder: 'Source code link',
              name: 'sourceCode',
              onChange: inputHandler,
            }}
          />
        )}

        {isProposalSubmitted ? (
          <div className="submitted-data source-code">
            <div className="label">6 - Invoice</div>
            {currentProposal.invoice ? (
              <div className="invoice-content">
                <div className="image-style">
                  <ImageWithPlug
                    noImageIconId="image"
                    imageLink={currentProposal.invoice}
                    alt="invoice for the proposal"
                  />
                </div>{' '}
                <a href={currentProposal.invoice}>{currentProposal.invoice}</a>
              </div>
            ) : (
              <div className="value">No link for an invoice given</div>
            )}
          </div>
        ) : (
          <div className="invoice">
            <IPFSUploader
              typeFile="image"
              imageIpfsUrl={currentProposal.invoice}
              setIpfsImageUrl={(e: string) => {
                inputHandler({
                  target: {
                    name: 'invoice',
                    value: e,
                  },
                })
              }}
              title={'Add an Invoice Image'}
              disabled={isProposalSubmitted || !isProposalPeriod || isFormDisabled}
              listNumber={6}
            />
          </div>
        )}
      </ProposalSubmittionStageOneBody>
    </>
  )
}

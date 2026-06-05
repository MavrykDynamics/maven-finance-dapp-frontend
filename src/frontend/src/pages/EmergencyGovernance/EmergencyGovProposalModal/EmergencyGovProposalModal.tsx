import { useMemo, useState } from 'react'

// hooks
import { useEGovContext } from 'providers/EmergencyGovernanceProvider/emergencyGovernance.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// consts
import {
  INPUT_MEDIUM,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'
import { SUBMIT_EGOV_PROPOSAL_ACTION } from 'providers/EmergencyGovernanceProvider/helpers/eGov.consts'

// utils
import { isValidLength } from '../../../utils/validatorFunctions'

// view
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { Input } from 'app/App.components/Input/NewInput'
import { TextArea } from 'app/App.components/TextArea/TextArea.controller'
import { EmergencyGovProposalModalContent } from './EmergencyGovProposalModal.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { NewInputLabel } from 'app/App.components/Input/Input.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { submitEGovProposal } from 'providers/EmergencyGovernanceProvider/actions/eGovActions'

const INITIAL_FORM_DATA: {
  title: { text: string; validation: InputStatusType }
  description: { text: string; validation: InputStatusType }
} = {
  title: {
    text: '',
    validation: '',
  },
  description: {
    text: '',
    validation: '',
  },
}

export const EmergencyGovProposalModal = ({ show, closeHandler }: { show: boolean; closeHandler: () => void }) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    maxLengths: {
      emergencyGovernance: { proposalTitleMaxLength, proposalDescMaxLength },
    },
    contractAddresses: { emergencyGovernanceAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const {
    config: { requiredFeeMutez },
  } = useEGovContext()

  const [proposalData, setProposalData] = useState(INITIAL_FORM_DATA)

  const isActionDisabled =
    isActionActive || Object.values(proposalData).some(({ validation }) => validation !== INPUT_STATUS_SUCCESS)

  const handleOnChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const validationStatus = isValidLength(value, 1, name === 'title' ? proposalTitleMaxLength : proposalDescMaxLength)
      ? INPUT_STATUS_SUCCESS
      : INPUT_STATUS_ERROR

    setProposalData({ ...proposalData, [name]: { text: value, validation: validationStatus } })
  }

  const submitEGovProposalProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SUBMIT_EGOV_PROPOSAL_ACTION,
      actionFn: async () => {
        try {
          if (!userAddress) {
            bug('Click Connect in the left menu', 'Please connect your wallet')
            return null
          }

          if (!emergencyGovernanceAddress) {
            bug('Wrong evergency governance address')
            return null
          }

          return await submitEGovProposal(
            emergencyGovernanceAddress,
            proposalData.title.text,
            proposalData.description.text,
          )
        } catch (e) {
          return null
        }
      },
    }),
    [emergencyGovernanceAddress, proposalData.description.text, proposalData.title.text, userAddress],
  )

  const { action: handleSubmitEGovProposal } = useContractAction(submitEGovProposalProps)

  return (
    <PopupContainer onClick={closeHandler} $show={show}>
      {/* TODO: update as farms */}
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans child-width">
        <button onClick={closeHandler} className="close-modal" />
        <EmergencyGovProposalModalContent>
          <h1>Trigger Emergency Governance Vote & Break Glass</h1>
          <div className="top-content">
            <Input
              inputProps={{
                value: proposalData.title.text,
                type: 'text',
                name: 'title',
                onChange: handleOnChange,
              }}
              settings={{
                inputStatus: proposalData.title.validation,
                label: 'Title',
                inputSize: INPUT_MEDIUM,
              }}
            />

            <div className="exit-fee">
              <NewInputLabel>Fee</NewInputLabel>
              <CommaNumber value={requiredFeeMutez} endingText="MVRK" />
            </div>
          </div>

          <TextArea
            name="description"
            value={proposalData.description.text}
            onChange={handleOnChange}
            label={'Description'}
            inputStatus={proposalData.description.validation}
            textAreaMaxLimit={proposalDescMaxLength}
          />

          <div className="buttons-container">
            <NewButton kind={BUTTON_SECONDARY} onClick={closeHandler} disabled={isActionActive}>
              <Icon id="navigation-menu_close" /> Cancel
            </NewButton>
            <NewButton kind={BUTTON_PRIMARY} disabled={isActionDisabled} onClick={handleSubmitEGovProposal}>
              <Icon id="auction" /> Initiate
            </NewButton>
          </div>
        </EmergencyGovProposalModalContent>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

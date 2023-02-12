import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { State } from 'reducers'
import { submitEmergencyGovernanceProposal } from '../EmergencyGovernance.actions'
import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { isValidLength } from '../../../utils/validatorFunctions'

import { Button, PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { Input } from 'app/App.components/Input/Input.controller'
import { TextArea } from 'app/App.components/TextArea/TextArea.controller'
import {
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
} from 'pages/ProposalSubmission/ProposalSubmission.style'
import {
  EmergencyGovProposalModalContent,
  ModalFormContentContainer,
  EmergencyGovProposalModalButtons,
} from './EmergencyGovProposalModal.style'

export const EmergencyGovProposalModal = ({ show, closeHandler }: { show: boolean; closeHandler: () => void }) => {
  const dispatch = useDispatch()
  const {
    governanceStorage: { fee },
  } = useSelector((state: State) => state.governance)
  const {
    config: { proposalTitleMaxLength, proposalDescMaxLength },
  } = useSelector((state: State) => state.emergencyGovernance)

  const [name, setName] = useState<{ text: string; validation: InputStatusType }>({
    text: '',
    validation: '',
  })

  const [description, setDescription] = useState<{ text: string; validation: InputStatusType }>({
    text: '',
    validation: '',
  })

  const handleOnBlur = (formField: string) => {
    switch (formField) {
      case 'TITLE':
        const isNameValid = isValidLength(name.text, 1, proposalTitleMaxLength)
          ? INPUT_STATUS_SUCCESS
          : INPUT_STATUS_ERROR
        setName({ ...name, validation: isNameValid })
        break
      case 'DESCRIPTION':
        const isDescrValid = isValidLength(description.text, 1, proposalDescMaxLength)
          ? INPUT_STATUS_SUCCESS
          : INPUT_STATUS_ERROR
        setDescription({ ...description, validation: isDescrValid })
        break
    }
  }

  const submitEmergencyGovProposalCallback = () => {
    if (name.validation === INPUT_STATUS_SUCCESS && description.validation === INPUT_STATUS_SUCCESS)
      dispatch(submitEmergencyGovernanceProposal({ title: name.text, description: description.text }))
  }

  return (
    <PopupContainer onClick={closeHandler} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="child-width">
        <button onClick={closeHandler} className="close_modal">
          +
        </button>
        <EmergencyGovProposalModalContent>
          <h1>Trigger Emergency Governance Vote & Break Glass</h1>
          <ModalFormContentContainer>
            <FormTitleAndFeeContainer className="eGov-modal">
              <FormTitleContainer style={{ width: '510px' }}>
                <label>Title</label>
                <Input
                  type="text"
                  value={name.text}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName({ ...name, text: e.target.value })}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur('TITLE')}
                  inputStatus={name.validation}
                />
              </FormTitleContainer>
              <div>
                <label>Fee</label>
                <FormTitleEntry>{fee} XTZ</FormTitleEntry>
              </div>
            </FormTitleAndFeeContainer>

            <label>Enter your description</label>
            <TextArea
              value={description.text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription({ ...description, text: e.target.value })
              }
              onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnBlur('DESCRIPTION')}
              inputStatus={description.validation}
              textAreaMaxLimit={proposalDescMaxLength}
            />
          </ModalFormContentContainer>
          <EmergencyGovProposalModalButtons>
            <Button text="Cancel" kind="actionSecondary" icon="error" onClick={closeHandler} />
            <Button text="Initiate" kind="actionPrimary" icon="auction" onClick={submitEmergencyGovProposalCallback} />
          </EmergencyGovProposalModalButtons>
        </EmergencyGovProposalModalContent>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

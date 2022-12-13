import { Button } from 'app/App.components/Button/Button.controller'
import { ModalCard, ModalCardContent, ModalClose, ModalMask, ModalStyled } from 'styles'

import {
  EmergencyGovProposalModalButtons,
  EmergencyGovProposalModalContent,
  ModalFormContentContainer,
} from './EmergencyGovProposalModal.style'
import {
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
} from '../../ProposalSubmission/ProposalSubmission.style'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import {
  EmergencyGovernanceProposalForm,
  EmergencyGovernanceProposalFormInputStatus,
} from '../../../utils/TypesAndInterfaces/Forms'

type EmergencyGovProposalModalViewProps = {
  showing: boolean
  submitEmergencyGovProposalCallback: (form: EmergencyGovernanceProposalForm | {}) => void
  cancelCallback: () => void
  form: EmergencyGovernanceProposalForm
  fee: number
  proposalDescMaxLength: number
  formInputStatus: EmergencyGovernanceProposalFormInputStatus
  setForm: (form: EmergencyGovernanceProposalForm) => void
  handleOnBlur: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
    formField: string,
  ) => void
}

export const EmergencyGovProposalModalView = ({
  showing,
  submitEmergencyGovProposalCallback,
  cancelCallback,
  form,
  fee,
  proposalDescMaxLength,
  formInputStatus,
  setForm,
  handleOnBlur,
}: EmergencyGovProposalModalViewProps) => {
  return (
    <ModalStyled showing={showing}>
      {showing && (
        <>
          <ModalMask showing={showing} onClick={cancelCallback} />
          <ModalCard>
            <ModalClose onClick={cancelCallback}>
              <svg>
                <use xlinkHref="/icons/sprites.svg#error" />
              </svg>
            </ModalClose>
            <ModalCardContent style={{ width: '750px' }}>
              <EmergencyGovProposalModalContent>
                <h1>Trigger Emergency Governance Vote & Break Glass</h1>
                <ModalFormContentContainer>
                  <FormTitleAndFeeContainer className="eGov-modal">
                    <FormTitleContainer style={{ width: '510px' }}>
                      <label>Title</label>
                      <Input
                        type="text"
                        value={form.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleOnBlur(e, 'TITLE')}
                        inputStatus={formInputStatus.title}
                      />
                    </FormTitleContainer>
                    <div>
                      <label>Fee</label>
                      <FormTitleEntry>{fee} XTZ</FormTitleEntry>
                    </div>
                  </FormTitleAndFeeContainer>

                  <label>Enter your description</label>
                  <TextArea
                    value={form.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOnBlur(e, 'DESCRIPTION')}
                    inputStatus={formInputStatus.description}
                    textAreaMaxLimit={proposalDescMaxLength}
                  />
                </ModalFormContentContainer>
                <EmergencyGovProposalModalButtons>
                  <Button text="Cancel" kind="actionSecondary" icon="error" onClick={cancelCallback} />
                  <Button
                    text="Initiate"
                    kind="actionPrimary"
                    icon="auction"
                    onClick={() => submitEmergencyGovProposalCallback({})}
                  />
                </EmergencyGovProposalModalButtons>
              </EmergencyGovProposalModalContent>
            </ModalCardContent>
          </ModalCard>
        </>
      )}
    </ModalStyled>
  )
}

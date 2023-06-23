import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { State } from 'reducers'
import { submitEmergencyGovernanceProposal } from '../EmergencyGovernance.actions'
import {
  InputStatusType,
  INPUT_LARGE,
  INPUT_MEDIUM,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from 'app/App.components/Input/Input.constants'
import { isValidLength } from '../../../utils/validatorFunctions'

import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { Input } from 'app/App.components/Input/NewInput'
import { TextArea } from 'app/App.components/TextArea/TextArea.controller'
import { EmergencyGovProposalModalContent } from './EmergencyGovProposalModal.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { NewInputLabel } from 'app/App.components/Input/Input.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'
import { useBreakGlassConfigInit } from 'providers/BreakGlassProvider/hooks/useBreakGlassConfigInit'

export const EmergencyGovProposalModal = ({ show, closeHandler }: { show: boolean; closeHandler: () => void }) => {
  const dispatch = useDispatch()
  const { fee } = useSelector((state: State) => state.governance.config)
  const {
    config: { proposalTitleMaxLength, proposalDescMaxLength },
  } = useSelector((state: State) => state.emergencyGovernance)
  const { isActionActive } = useSelector((state: State) => state.loading)

  useBreakGlassConfigInit()

  const [proposalData, setProposalData] = useState<{
    title: { text: string; validation: InputStatusType }
    description: { text: string; validation: InputStatusType }
  }>({
    title: {
      text: '',
      validation: '',
    },
    description: {
      text: '',
      validation: '',
    },
  })

  const isActionDisabled =
    (proposalData.title.validation !== INPUT_STATUS_SUCCESS &&
      proposalData.description.validation !== INPUT_STATUS_SUCCESS) ||
    isActionActive

  const handleOnChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const validationStatus = isValidLength(value, 1, name === 'title' ? proposalTitleMaxLength : proposalDescMaxLength)
      ? INPUT_STATUS_SUCCESS
      : INPUT_STATUS_ERROR

    setProposalData({ ...proposalData, [name]: { text: value, validation: validationStatus } })
  }

  const submitEmergencyGovProposalCallback = () => {
    if (!isActionDisabled)
      dispatch(
        submitEmergencyGovernanceProposal(
          {
            title: proposalData.title.text,
            description: proposalData.description.text,
          },
          closeHandler,
        ),
      )
  }

  return (
    <PopupContainer onClick={closeHandler} show={show}>
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
              <CommaNumber value={fee} endingText="XTZ" />
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
            <NewButton kind={BUTTON_PRIMARY} disabled={isActionDisabled} onClick={submitEmergencyGovProposalCallback}>
              <Icon id="auction" /> Initiate
            </NewButton>
          </div>
        </EmergencyGovProposalModalContent>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

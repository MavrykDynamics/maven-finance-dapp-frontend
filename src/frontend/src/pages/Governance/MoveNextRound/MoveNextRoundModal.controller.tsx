import * as React from 'react'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { BUTTON_SECONDARY, BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

// style
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { MoveNextRoundModalStyled } from './MoveNextRoundModal.style'

// TODO: add estimation before calling this modal
export const MoveNextRoundModal = ({
  showModal,
  handleMoveNextRound,
  handleExecuteProposal,
  handleCloseModal,
  estimatedValues: { fee, cost },
}: {
  showModal: boolean
  handleMoveNextRound: () => void
  handleExecuteProposal: () => void
  handleCloseModal: () => void
  estimatedValues: { fee: number; cost: number }
}) => {
  return (
    <PopupContainer onClick={handleCloseModal} show={showModal}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <MoveNextRoundModalStyled>
          <button onClick={handleCloseModal} className="close-modal" />

          <h1>Move to the next round</h1>
          <p>Do you want to Execute Proposal or move to the next round without execution?</p>

          <div className="step-info">
            <div className="name">Minimal Fee</div>
            <div className="value">
              <CommaNumber value={fee} endingText="tez" decimalsToShow={4} />
            </div>
          </div>
          <div className="step-info">
            <div className="name">Estimated total Cost</div>
            <div className="value">
              <CommaNumber value={cost} endingText="tez" decimalsToShow={4} />
            </div>
          </div>
          <div className="btn-group">
            <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={handleMoveNextRound}>
              Move to the next round
            </NewButton>
            <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={handleExecuteProposal}>
              Execute Proposal
            </NewButton>
          </div>
        </MoveNextRoundModalStyled>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

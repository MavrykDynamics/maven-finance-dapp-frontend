import * as React from 'react'

// view
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// style
import { ModalCard, ModalCardContent, ModalStyled, ModalMask, ModalClose } from 'styles'
import { MoveNextRoundModalstyle } from './MoveNextRoundModal.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// TODO: add estimation before calling this modal
export const MoveNextRoundModal = ({
  handleMoveNextRound,
  handleExecuteProposal,
  handleCloseModal,
  estimatedValues: { fee, cost },
}: {
  handleMoveNextRound: () => void
  handleExecuteProposal: () => void
  handleCloseModal: () => void
  estimatedValues: { fee: number; cost: number }
}) => {
  return (
    <MoveNextRoundModalstyle>
      <ModalStyled showing={true}>
        <ModalMask showing={true} onClick={handleCloseModal} />
        <ModalCard>
          <ModalClose onClick={handleCloseModal}>
            <Icon id="error" />
          </ModalClose>
          <ModalCardContent style={{ width: '586px' }}>
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
              <Button text="Move to the next round" kind="actionSecondary" onClick={handleMoveNextRound} />
              <Button text="Execute Proposal" kind="actionPrimary" onClick={() => handleExecuteProposal()} />
            </div>
          </ModalCardContent>
        </ModalCard>
      </ModalStyled>
    </MoveNextRoundModalstyle>
  )
}

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { State } from 'reducers'
import { GovPhases } from 'utils/TypesAndInterfaces/Governance'

// components
import { MoveNextRoundModalBase } from './MoveNextRoundModal.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

import { startNextRound } from 'pages/Governance/actions/GovernanceInteraction.actions'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

export default function MoveToNextRound() {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { timelockProposalId, governancePhase } = useSelector((state: State) => state.governance.config)

  const [showModal, setShowModal] = useState(false)
  const [estimatedValues] = useState({ fee: 0, cost: 0 })

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const modalMoveNext = () => {
    dispatch(startNextRound(false))
    handleCloseModal()
  }

  const modalExecute = () => {
    dispatch(startNextRound(true))
    handleCloseModal()
  }

  const handleMoveNextRound = () => {
    if (governancePhase === GovPhases.TIMELOCK && timelockProposalId > 0) {
      setShowModal(true)
    } else {
      modalMoveNext()
    }
  }

  // TODO: add estimation for execution
  // useEffect(() => {
  //   ;(async () => {
  //     if (tezos && govAddress) {
  //       const { minimalFeeMutez, totalCost } = await estimateExecution(19, tezos, govAddress)
  //       setEstimatedValues({ fee: minimalFeeMutez, cost: totalCost })
  //     }
  //   })()
  // }, [currentRoundProposals, govAddress, tezos])

  return (
    <>
      <Button kind={BUTTON_SECONDARY} disabled={!accountPkh} onClick={handleMoveNextRound}>
        <Icon id="upload" />
        Move to next round
      </Button>

      {showModal ? (
        <PopupContainer onClick={handleCloseModal} show={showModal}>
          <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
            <MoveNextRoundModalBase>
              <button onClick={handleCloseModal} className="close-modal" />
              <GovRightContainerTitleArea>
                <h2>Move to the next round</h2>
              </GovRightContainerTitleArea>
              <div className="descr">Do you want to Execute Proposal or move to the next round without execution?</div>

              <div className="calcs">
                <div className="row">
                  <div className="name">Minimal Fee</div>
                  <CommaNumber value={estimatedValues.fee} endingText="tez" decimalsToShow={4} className="value" />
                </div>
                <div className="row">
                  <div className="name">Estimated total Cost</div>
                  <CommaNumber value={estimatedValues.cost} endingText="tez" decimalsToShow={4} className="value" />
                </div>
              </div>

              <div className="buttons">
                <Button kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={modalMoveNext}>
                  Move to the next round
                </Button>
                <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={modalExecute}>
                  Execute Proposal
                </Button>
              </div>
            </MoveNextRoundModalBase>
          </PopupContainerWrapper>
        </PopupContainer>
      ) : null}
    </>
  )
}

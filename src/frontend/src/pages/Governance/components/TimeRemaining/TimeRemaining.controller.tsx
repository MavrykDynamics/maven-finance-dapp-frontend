import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// Components
import { Timer } from 'app/App.components/Timer/Timer.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// Styled components
import { MoveNextRoundModalBase, TimeLeftAreaWrap } from './TimeRemaining.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/SettingsPopup/SettingsPopup.style'

// Consts
import { COLON_VIEW } from 'app/App.components/Timer/Timer.view'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { GovPhases } from 'utils/TypesAndInterfaces/Governance'

// Actions, helpers
import getTimestampByLevel from 'utils/api/getTimestampByLevel'
import { startNextRound } from 'pages/Governance/actions/GovernanceInteraction.actions'

export default function TimeRemaining() {
  const dispatch = useDispatch()

  const { currentRoundEndLevel, timelockProposalId, governancePhase } = useSelector(
    (state: State) => state.governance.config,
  )
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const [timerDeadline, setTimerDeadline] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [estimatedValues] = useState({ fee: 0, cost: 0 })

  const handleCloseModal = () => setShowModal(false)

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

  useEffect(() => {
    const setTimerData = async () => {
      try {
        const duration = await getTimestampByLevel(currentRoundEndLevel)
        const convertedToTimestamp = new Date(duration).getTime()
        const isTimestampValid = convertedToTimestamp > Date.now()

        setTimerActive(isTimestampValid)
        if (isTimestampValid) setTimerDeadline(convertedToTimestamp)
      } catch (e) {
        console.error('TimeRemaining, setTimerData error: ', e)
      }
    }

    setTimerData()
  }, [currentRoundEndLevel])

  return (
    <TimeLeftAreaWrap showBorder={timerActive}>
      {timerActive ? (
        <>
          <Timer
            timestamp={timerDeadline}
            options={{
              showZeros: true,
              shownParts: ['h', 'm', 's'],
              timerView: COLON_VIEW,
              showFullDay: false,
              endText: 'remaining',
              defaultColor: '#77A4F2',
            }}
          />
        </>
      ) : (
        <Button kind={BUTTON_SECONDARY} disabled={!accountPkh} onClick={handleMoveNextRound}>
          <Icon id="upload" />
          Move to next round
        </Button>
      )}

      <PopupContainer onClick={handleCloseModal} show={showModal}>
        <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
          <button onClick={handleCloseModal} className="close-modal" />
          <MoveNextRoundModalBase>
            <H2Title>Move to the next round</H2Title>
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
    </TimeLeftAreaWrap>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'

// Consts
import { COLON_VIEW } from 'app/App.components/Timer/Timer.view'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { GovPhases } from 'utils/TypesAndInterfaces/Governance'
import { START_NEXT_ROUND_ACTION } from 'providers/ProposalsProvider/helpers/proposals.const'

// providers
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// Actions, helpers
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
} from 'utils/api/api-helpers/getTimestampByLevel'
import { startNextRound } from 'providers/ProposalsProvider/actions/proposalsGovernanceInteraction.actions'
import { api } from 'utils/api/api'
import { isAbortError, unknownToError } from 'errors/error'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

export default function TimeRemaining() {
  const dispatch = useDispatch()

  const { currentRoundEndLevel, timelockProposalId, governancePhase } = useSelector(
    (state: State) => state.governance.config,
  )
  const { userAddress } = useUserContext()
  const {
    contractAddresses: { governanceAddress },
  } = useDappConfigContext()

  const { bug } = useToasterContext()
  const [timerDeadline, setTimerDeadline] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [estimatedValues] = useState({ fee: 0, cost: 0 })

  const handleCloseModal = () => setShowModal(false)

  // start | execute next round actions ------------------------------------------
  const handleNextRoundActionFn = useCallback(
    async (executePastProposal: boolean) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }
      if (!governanceAddress) {
        bug('Wrong governance address')
        return null
      }

      return await startNextRound(governanceAddress, executePastProposal)
    },
    [bug, governanceAddress, userAddress],
  )

  const dappActionCallback = useCallback(() => {
    dispatch(getGovernanceStorage())
  }, [dispatch])

  const nextRoundContractProps: (executePastProposal: boolean) => HookContractActionArgs = useCallback(
    (executePastProposal: boolean) => ({
      actionType: START_NEXT_ROUND_ACTION,
      actionFn: handleNextRoundActionFn.bind(null, executePastProposal),
      dappActionCallback,
    }),
    [dappActionCallback, handleNextRoundActionFn],
  )

  // same action with 2 different boolean values, so need 2 seperate fns to handle it
  const handleNextRound = useContractAction(nextRoundContractProps(false))
  const handleExecuteRound = useContractAction(nextRoundContractProps(true))

  const modalMoveNext = async () => {
    try {
      await handleNextRound()
      handleCloseModal()
    } catch (e) {
      const err = unknownToError(e)
      bug(err.message)
    }
  }

  const modalExecute = async () => {
    try {
      await handleExecuteRound()
      handleCloseModal()
    } catch (e) {
      const err = unknownToError(e)
      bug(err.message)
    }
  }

  const handleMoveNextRound = () => {
    if (governancePhase === GovPhases.TIMELOCK && timelockProposalId > 0) {
      setShowModal(true)
    } else {
      modalMoveNext()
    }
  }

  useEffect(() => {
    const abortController = new AbortController()

    ;(async () => {
      try {
        const { data: duration } = await api(
          getTimestampByLevelUrl(currentRoundEndLevel),
          { signal: abortController.signal, headers: getTimestampByLevelHeaders },
          getTimestampByLevelSchema,
        )
        const convertedToTimestamp = new Date(duration).getTime()
        const isTimestampValid = convertedToTimestamp > Date.now()

        setTimerActive(isTimestampValid)
        if (isTimestampValid) setTimerDeadline(convertedToTimestamp)
      } catch (e) {
        // TODO: handle fetch errors when error boundary will be ready
        if (!isAbortError(e)) {
          console.error('getting timestamp by lvl error: ', e)
        }
        bug('Unexpected error happened occured, please reload the page')
      }
    })()

    return () => abortController.abort()
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
        <Button kind={BUTTON_SECONDARY} disabled={!userAddress} onClick={handleMoveNextRound}>
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

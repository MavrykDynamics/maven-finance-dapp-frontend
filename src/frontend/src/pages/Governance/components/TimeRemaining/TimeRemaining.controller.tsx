import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Components
import { Timer } from 'app/App.components/Timer/Timer.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// Styled components
import { MoveNextRoundModalBase, TimeLeftAreaWrap } from './TimeRemaining.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import colors from 'styles/colors'

// Consts
import { COLON_VIEW } from 'app/App.components/Timer/Timer.view'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { GovPhases, START_NEXT_ROUND_ACTION } from 'providers/ProposalsProvider/helpers/proposals.const'

// providers
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useProposalsContext } from 'providers/ProposalsProvider/proposals.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// actions, helpers
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
} from 'utils/api/api-helpers/getTimestampByLevel'
import { startNextRound } from 'providers/ProposalsProvider/actions/proposalsGovernanceInteraction.actions'
import { api } from 'utils/api/api'
import { isAbortError, unknownToError } from 'errors/error'

export default function TimeRemaining() {
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    config: { currentRoundEndLevel, timelockProposalId, governancePhase },
  } = useProposalsContext()
  const {
    contractAddresses: { governanceAddress },
    preferences: { themeSelected },
  } = useDappConfigContext()

  const intervalRef = useRef<null | any>(null)

  const [timerDeadline, setTimerDeadline] = useState(0)
  const [showTimer, setShowTimer] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // TODO: implement this estimation for popup
  const [estimatedValues] = useState({ fee: 0, cost: 0 })

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

        setTimerDeadline(convertedToTimestamp)
      } catch (e) {
        // TODO: handle fetch errors when error boundary will be ready
        if (!isAbortError(e)) {
          console.error('getting timestamp by lvl error: ', e)
          bug('Unexpected error happened occured, please reload the page')
        }
      }
    })()

    return () => abortController.abort()
  }, [currentRoundEndLevel])

  useEffect(() => {
    if (timerDeadline) {
      intervalRef.current = setInterval(() => {
        const isTimerActive = dayjs().isBefore(timerDeadline)
        setShowTimer(isTimerActive)
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerDeadline])

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

  const nextRoundContractProps: HookContractActionArgs<boolean> = useMemo(
    () => ({
      actionType: START_NEXT_ROUND_ACTION,
      actionFn: handleNextRoundActionFn,
    }),
    [handleNextRoundActionFn],
  )

  // same action with 2 different boolean values, so need 2 seperate fns to handle it
  const { actionWithArgs: handleNextRound } = useContractAction<boolean>(nextRoundContractProps)

  const modalMoveNext = async () => {
    try {
      await handleNextRound(false)
      handleCloseModal()
    } catch (e) {
      bug(unknownToError(e).message)
    }
  }

  const modalExecute = async () => {
    try {
      await handleNextRound(true)
      handleCloseModal()
    } catch (e) {
      bug(unknownToError(e).message)
    }
  }

  const handleMoveNextRound = () => {
    if (governancePhase === GovPhases.TIMELOCK && timelockProposalId && timelockProposalId > 0) {
      setShowModal(true)
    } else {
      modalMoveNext()
    }
  }

  return (
    <TimeLeftAreaWrap $showBorder={showTimer}>
      {showTimer ? (
        <>
          <Timer
            timestamp={timerDeadline}
            options={{
              showZeros: true,
              shownParts: ['h', 'm', 's'],
              timerView: COLON_VIEW,
              showFullDay: false,
              endText: 'remaining',
              defaultColor: colors[themeSelected].primaryText,
            }}
          />
        </>
      ) : (
        <Button kind={BUTTON_SECONDARY} disabled={!userAddress} onClick={handleMoveNextRound}>
          <Icon id="upload" />
          Move to next round
        </Button>
      )}

      <PopupContainer onClick={handleCloseModal} $show={showModal}>
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

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { MoveNextRoundModal } from './MoveNextRoundModal.controller'
import NewButton from 'app/App.components/Button/NewButton'
import { BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'
import Icon from 'app/App.components/Icon/Icon.view'
import { startNextRound } from '../actions/GovernanceInteraction.actions'

// actions

export default function MoveToNextRound() {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { timelockProposalId, governancePhase } = useSelector((state: State) => state.governance.config)

  const [visibleModal, setVisibleModal] = useState(false)
  const [estimatedValues] = useState({ fee: 0, cost: 0 })
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  const handleCloseModal = () => {
    setVisibleModal(false)
  }
  const handleStartNextRound = async (variant: boolean) => {
    await dispatch(startNextRound(variant))
    handleCloseModal()
  }

  const handleMoveNextRound = () => {
    if (isTimeLockRound && timelockProposalId > 0) {
      setVisibleModal(true)
    } else {
      handleStartNextRound(false)
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
      <NewButton kind={BUTTON_SECONDARY} disabled={!accountPkh} onClick={handleMoveNextRound}>
        <Icon id="upload" />
        Move to next round
      </NewButton>

      {visibleModal ? (
        <MoveNextRoundModal
          handleCloseModal={handleCloseModal}
          handleExecuteProposal={() => handleStartNextRound(true)}
          handleMoveNextRound={() => handleStartNextRound(false)}
          estimatedValues={estimatedValues}
        />
      ) : null}
    </>
  )
}

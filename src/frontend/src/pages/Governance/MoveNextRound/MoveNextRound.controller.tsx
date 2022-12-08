import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { Button } from '../../../app/App.components/Button/Button.controller'
import { MoveNextRoundModal } from './MoveNextRoundModal.controller'

// actions
import { estimateExecution, startNextRound } from '../Governance.actions'

export default function MoveToNextRound() {
  const dispatch = useDispatch()
  const { accountPkh, tezos } = useSelector((state: State) => state.wallet)
  const govAddress = useSelector((state: State) => state.contractAddresses?.governanceAddress?.address)
  const { governanceStorage, governancePhase, currentRoundProposals } = useSelector((state: State) => state.governance)

  const [visibleModal, setVisibleModal] = useState(false)
  const [estimatedValues, setEstimatedValues] = useState({ fee: 0, cost: 0 })
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  const handleCloseModal = () => {
    setVisibleModal(false)
  }
  const handleStartNextRound = async (variant: boolean) => {
    await dispatch(startNextRound(variant))
    handleCloseModal()
  }

  const handleMoveNextRound = () => {
    if (isTimeLockRound && governanceStorage.timelockProposalId > 0) {
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
      <Button
        icon="upload"
        text={'Move to next round'}
        kind="actionSecondary"
        className="move-to-next"
        disabled={!accountPkh}
        onClick={handleMoveNextRound}
      />
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

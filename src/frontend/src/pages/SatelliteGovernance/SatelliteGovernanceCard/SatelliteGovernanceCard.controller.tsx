import { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { Button } from '../../../app/App.components/Button/Button.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { getSeparateSnakeCase } from '../../../utils/parse'
import { ProposalStatus, SatelliteGovernance } from '../../../utils/TypesAndInterfaces/Governance'
import Expand from '../../../app/App.components/Expand/Expand.view'

// action
import { dropAction, voteForAction } from '../SatelliteGovernance.actions'

import { SatelliteGovernanceCardDropDown, SatelliteGovernanceCardTitleTextGroup } from './SatelliteGovernanceCard.style'
import { VotingArea } from 'app/App.components/VotingArea/VotingArea.controller'
import { PRECISION_NUMBER } from 'utils/constants'
import { parseDate } from 'utils/time'

type Props = {
  satelliteId: string
  initiatorId: string
  date: string | null
  executed: boolean
  status: number
  id: number
  purpose: string
  governanceType: string
  smvkPercentageForApproval: number
  yayVotesSmvkTotal: number
  nayVotesSmvkTotal: number
  passVoteSmvkTotal: number
  snapshotSmvkTotalSupply: number
  accountPkh?: string
  isActionActive: boolean
  votes: SatelliteGovernance['satelliteGovIdsMapper'][0]['votes']
}

export const SatelliteGovernanceCard = ({
  id,
  satelliteId,
  initiatorId,
  date,
  executed,
  status,
  purpose,
  governanceType,
  smvkPercentageForApproval,
  yayVotesSmvkTotal,
  nayVotesSmvkTotal,
  passVoteSmvkTotal,
  snapshotSmvkTotalSupply,
  accountPkh,
  isActionActive,
  votes,
}: Props) => {
  const dispatch = useDispatch()

  const [expanded, setExpanded] = useState(false)

  const myVote = useMemo(() => votes.find((item) => item.voterId === accountPkh)?.vote, [accountPkh, votes])
  const open = () => setExpanded(!expanded)

  const handleVotingRoundVote = (type: string) => {
    dispatch(voteForAction(id, type, open))
  }

  const handleClick = async () => {
    console.log('Logging is actionActive', isActionActive)
    await dispatch(dropAction(id, open))
  }

  const timeNow = Date.now()
  const expirationDatetime = new Date(date ?? 0).getTime()
  const isEndingVotingTime = expirationDatetime > timeNow

  const statusFlag = executed
    ? ProposalStatus.EXECUTED
    : status === 1
    ? ProposalStatus.DROPPED
    : isEndingVotingTime
    ? ProposalStatus.ONGOING
    : ProposalStatus.DEFEATED

  const voteStatistic = useMemo(
    () => ({
      forVotesMVKTotal: yayVotesSmvkTotal / PRECISION_NUMBER,
      againstVotesMVKTotal: nayVotesSmvkTotal / PRECISION_NUMBER,
      abstainVotesMVKTotal: passVoteSmvkTotal / PRECISION_NUMBER,
      unusedVotesMVKTotal: Math.round(
        snapshotSmvkTotalSupply / PRECISION_NUMBER -
          yayVotesSmvkTotal / PRECISION_NUMBER -
          nayVotesSmvkTotal / PRECISION_NUMBER -
          passVoteSmvkTotal / PRECISION_NUMBER,
      ),
      quorum: smvkPercentageForApproval / 100,
    }),
    [yayVotesSmvkTotal, nayVotesSmvkTotal, passVoteSmvkTotal, snapshotSmvkTotalSupply, smvkPercentageForApproval],
  )

  return (
    <Expand
      className="expand-governance"
      header={
        <>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3>Date</h3>
            <p className="inner">{parseDate({ time: date, timeFormat: 'MMM Do, YYYY' })}</p>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3>Action</h3>
            <p className="inner capitallize">{getSeparateSnakeCase(governanceType)}</p>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3>Target</h3>
            <div className="inner">
              <TzAddress tzAddress={satelliteId} hasIcon={true} />
            </div>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3>Initiator</h3>
            <div className="inner">
              <TzAddress tzAddress={initiatorId} hasIcon={true} />
            </div>
          </SatelliteGovernanceCardTitleTextGroup>
        </>
      }
      sufix={<StatusFlag className="expand-gov-status" status={statusFlag} text={statusFlag} />}
    >
      <SatelliteGovernanceCardDropDown>
        <div className="purpose-block">
          <div>
            <h3>Purpose</h3>
            <p className="purpose">{purpose}</p>

            {initiatorId ? (
              <Link className={'view-satellite'} to={`/satellites/satellite-details/${satelliteId}`}>
                Profile Details
              </Link>
            ) : null}
          </div>

          {statusFlag === ProposalStatus.ONGOING && accountPkh === initiatorId ? (
            <Button
              text="Drop Action"
              className="drop-btn"
              icon="close-stroke"
              kind={'actionSecondary'}
              onClick={handleClick}
              disabled={isActionActive}
            />
          ) : null}
        </div>
        <div className="voting-block">
          <h3>Vote Statistics</h3>
          <b className="voting-ends">
            Voting {!isEndingVotingTime ? 'ended' : 'ending'} on{' '}
            {parseDate({ time: date, timeFormat: 'MMM DD, HH:mm' })} CEST
          </b>

          <VotingArea
            voteStatistics={voteStatistic}
            isVotingActive={statusFlag === ProposalStatus.ONGOING}
            handleVote={handleVotingRoundVote}
            disableVotingButtons={isActionActive}
            disableButtonByVote={myVote}
          />
        </div>
      </SatelliteGovernanceCardDropDown>
    </Expand>
  )
}

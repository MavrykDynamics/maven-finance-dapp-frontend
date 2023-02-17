import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// helpers
import { ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
import { dropEmergencyGovernanceProposal, voteEmergencyGovernanceProposal } from '../EmergencyGovernance.actions'
import { skyColor } from 'styles/colors'
import { COLON_VIEW } from 'app/App.components/Timer/Timer.view'
import { parseDate } from 'utils/time'

import type { State } from 'reducers'
import type { EmergergencyGovernanceItem } from '../../../utils/TypesAndInterfaces/EmergencyGovernance'

// view
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { Button } from 'app/App.components/Button/Button.controller'
import Expand from 'app/App.components/Expand/Expand.view'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { VotingArea } from 'app/App.components/VotingArea/VotingArea.controller'

// styles
import { EGovActiveCardStyled } from './EGovCard.style'
import {
  SatelliteGovernanceCardDropDown,
  SatelliteGovernanceCardTitleTextGroup,
} from 'pages/SatelliteGovernance/SatelliteGovernanceCard/SatelliteGovernanceCard.style'

type EGovCardProps = {
  emergencyGovernance: EmergergencyGovernanceItem
}

export const EGovCard = ({ emergencyGovernance }: EGovCardProps) => {
  const dispatch = useDispatch()
  const { totalStakedMvk } = useSelector((state: State) => state.doorman)
  const {
    config: { minStakedMvkRequiredToVote },
  } = useSelector((state: State) => state.emergencyGovernance)
  const {
    accountPkh,
    user: { mySMvkTokenBalance },
  } = useSelector((state: State) => state.wallet)

  const isActiveProposal =
    !emergencyGovernance.executed &&
    !emergencyGovernance.dropped &&
    emergencyGovernance.expirationTimestamp > Date.now()

  const handleProposalVote = async () => {
    await dispatch(voteEmergencyGovernanceProposal())
  }

  const dropProposalHandler = async () => {
    await dispatch(dropEmergencyGovernanceProposal())
  }

  const status = isActiveProposal
    ? ProposalStatus.WAITING
    : emergencyGovernance.executed
    ? ProposalStatus.EXECUTED
    : emergencyGovernance.dropped
    ? ProposalStatus.DROPPED
    : ProposalStatus.DEFEATED

  const votingStatistic = useMemo(
    () => ({
      forVotesMVKTotal: emergencyGovernance.totalsMvkVotes,
      unusedVotesMVKTotal: totalStakedMvk ?? 0,
      quorum: emergencyGovernance?.sMvkPercentageRequired ?? 0,
    }),
    [emergencyGovernance?.sMvkPercentageRequired, emergencyGovernance.totalsMvkVotes, totalStakedMvk],
  )

  return isActiveProposal ? (
    <EGovActiveCardStyled>
      <h2>{emergencyGovernance.title}</h2>
      <div className="voting-ends">
        Voting ends in{' '}
        <Timer
          timestamp={new Date(emergencyGovernance.expirationTimestamp).getTime()}
          options={{
            showZeros: true,
            timerView: COLON_VIEW,
            defaultColor: skyColor,
          }}
        />
      </div>
      <div className="main-info">
        <div className="left">
          <div className="descr">{emergencyGovernance.description}</div>
          <Button
            text="Drop Proposal"
            onClick={dropProposalHandler}
            kind={ACTION_SECONDARY}
            disabled={emergencyGovernance.proposerId !== accountPkh}
          />
        </div>
        <VotingArea
          voteStatistics={votingStatistic}
          isVotingActive={true}
          disableVotingButtons={
            Boolean(emergencyGovernance.voters.find((voter) => accountPkh === voter.voterId)) ||
            mySMvkTokenBalance < minStakedMvkRequiredToVote
          }
          handleVote={handleProposalVote}
          buttonsToShow={{ forBtn: { text: 'Vote to Trigger' } }}
          className="eGov-voting"
        />
      </div>
    </EGovActiveCardStyled>
  ) : (
    <Expand
      className="expand-egov"
      header={
        <>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3>Title</h3>
            <p className="inner">{emergencyGovernance.title}</p>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3>Date</h3>
            <p className="inner capitallize">
              {parseDate({
                time: new Date(emergencyGovernance.startTimestamp).getTime(),
                timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC',
              })}
            </p>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3>Proposer</h3>
            <div className="inner">
              <TzAddress tzAddress={emergencyGovernance.proposerId} hasIcon={true} />
            </div>
          </SatelliteGovernanceCardTitleTextGroup>
        </>
      }
      sufix={<StatusFlag className="expand-gov-status" status={status} text={status} />}
    >
      <SatelliteGovernanceCardDropDown>
        <div className="left">
          <h3>Description</h3>
          <p className="purpose">{emergencyGovernance.description}</p>
        </div>
        <div className="voting-block">
          <h3>Vote Statistics</h3>
          <b className="voting-ends">
            Voting ended on{' '}
            {parseDate({
              time: emergencyGovernance.executed
                ? emergencyGovernance.executionTimestamp
                : emergencyGovernance.expirationTimestamp,
              timeFormat: 'MMM DD, HH:mm',
            })}{' '}
            CEST
          </b>

          <VotingArea voteStatistics={votingStatistic} isVotingActive={false} />
        </div>
      </SatelliteGovernanceCardDropDown>
    </Expand>
  )
}

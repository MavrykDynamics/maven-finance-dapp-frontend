import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

import type { EmergencyGovernanceStorage } from '../../../utils/TypesAndInterfaces/EmergencyGovernance'

// view
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { VotingArea } from 'app/App.components/VotingArea/VotingArea.controller'

import { PRECISION_NUMBER } from 'utils/constants'

import { EGovActiveCardStyled } from './EGovCard.style'
import { parseDate } from 'utils/time'
import { ACTION_PRIMARY, ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import Expand from 'app/App.components/Expand/Expand.view'
import {
  SatelliteGovernanceCardDropDown,
  SatelliteGovernanceCardTitleTextGroup,
} from 'pages/SatelliteGovernance/SatelliteGovernanceCard/SatelliteGovernanceCard.style'
import { VotingTypes } from 'app/App.components/VotingArea/helpers/voting.const'

type EGovHistoryCardProps = {
  emergencyGovernance: EmergencyGovernanceStorage['emergencyGovernanceLedger'][0]
  dropProposalHandler: (proposalId: number) => void
}
export const EGovHistoryCard = ({ emergencyGovernance, dropProposalHandler }: EGovHistoryCardProps) => {
  const { totalStakedMvk } = useSelector((state: State) => state.doorman)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const isActiveProposal =
    !emergencyGovernance.executed &&
    !emergencyGovernance.dropped &&
    emergencyGovernance.expirationTimestamp > Date.now()

  const handleProposalVote = (vote: string) => {
    switch (vote) {
      case VotingTypes.YES:
        break
      case VotingTypes.NO:
        break
      case VotingTypes.PASS:
        break
    }
  }

  const status = isActiveProposal
    ? ProposalStatus.WAITING
    : emergencyGovernance.executed
    ? ProposalStatus.EXECUTED
    : emergencyGovernance.dropped
    ? ProposalStatus.DROPPED
    : ProposalStatus.DEFEATED

  // TODO: clarify it with sam, cuz this data isn't right
  const votingStatistic = useMemo(
    () => ({
      forVotesMVKTotal: emergencyGovernance.totalsMvkVotes,
      unusedVotesMVKTotal: Math.round((totalStakedMvk ?? 0 / PRECISION_NUMBER) - emergencyGovernance.totalsMvkVotes),
      quorum: emergencyGovernance?.sMvkPercentageRequired ?? 0,
    }),
    [emergencyGovernance?.sMvkPercentageRequired, emergencyGovernance.totalsMvkVotes, totalStakedMvk],
  )

  console.log('emergencyGovernance', emergencyGovernance)

  return true ? (
    <EGovActiveCardStyled>
      <h2>{emergencyGovernance.title}</h2>
      <div className="voting-ends">
        Voting ends in{' '}
        {parseDate({
          time: Date.now() - new Date(emergencyGovernance.expirationTimestamp).getTime(),
          timeFormat: 'HH:mm',
        })}{' '}
        CEST
      </div>
      <div className="main-info">
        <div className="left">
          <div className="descr">{emergencyGovernance.description}</div>
          <Button
            text="Drop Proposal"
            onClick={() => dropProposalHandler(emergencyGovernance.id)}
            kind={ACTION_SECONDARY}
          />
        </div>
        <VotingArea
          voteStatistics={votingStatistic}
          isVotingActive={true}
          disableVotingButtons={Boolean(emergencyGovernance.voters.find((voter) => accountPkh === voter.voterId))}
          handleVote={handleProposalVote}
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

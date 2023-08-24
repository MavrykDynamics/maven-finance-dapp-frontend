import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// helpers
import { dropEmergencyGovernanceProposal, voteEmergencyGovernanceProposal } from '../EmergencyGovernance.actions'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { parseDate } from 'utils/time'

// consts
import { ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { COLON_VIEW } from 'app/App.components/Timer/Timer.view'
import colors from 'styles/colors'
import { ProposalStatus } from 'providers/ProposalsProvider/helpers/proposals.const'

// types
import type { State } from 'reducers'
import type { EmergergencyGovernanceItem } from '../../../utils/TypesAndInterfaces/EmergencyGovernance'

// view
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Button } from 'app/App.components/Button/Button.controller'
import Expand from 'app/App.components/Expand/Expand.view'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { VotingArea } from 'app/App.components/VotingArea/VotingArea.controller'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useDoormanContext } from 'providers/DoormanProvider/doorman.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

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
  const { totalStakedMvk } = useDoormanContext()
  const { userTokensBalances } = useUserContext()

  const { isActionActive } = useSelector((state: State) => state.loading)
  const {
    config: { minStakedMvkRequiredToVote },
  } = useSelector((state: State) => state.emergencyGovernance)
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const isActiveProposal =
    !emergencyGovernance.executed &&
    !emergencyGovernance.dropped &&
    emergencyGovernance.expirationTimestamp > Date.now()

  const handleProposalVote = async () => await dispatch(voteEmergencyGovernanceProposal())
  const dropProposalHandler = async () => await dispatch(dropEmergencyGovernanceProposal())

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
            defaultColor: colors[themeSelected].primaryText,
            negativeColor: colors[themeSelected].downColor,
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
            disabled={emergencyGovernance.proposerId !== accountPkh || isActionActive}
          />
        </div>
        <VotingArea
          voteStatistics={votingStatistic}
          isVotingActive={true}
          disableVotingButtons={
            Boolean(emergencyGovernance.voters.find((voter) => accountPkh === voter.voterId)) ||
            getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS }) <
              minStakedMvkRequiredToVote
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
            <h3 className="name">Title</h3>
            <p className="value">{emergencyGovernance.title}</p>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3 className="name">Date</h3>
            <p className="value capitallize">
              {parseDate({
                time: new Date(emergencyGovernance.startTimestamp).getTime(),
                timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC',
              })}
            </p>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3 className="name">Proposer</h3>
            <div className="value">
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
          <p>{emergencyGovernance.description}</p>
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

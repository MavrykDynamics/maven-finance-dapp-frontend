import { useMemo } from 'react'
import dayjs from 'dayjs'

// helpers
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { parseDate } from 'utils/time'
import { voteForEGovProposal } from 'providers/EmergencyGovernanceProvider/actions/eGovActions'

// consts
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { VOTE_FOR_EGOV_PROPOSAL_ACTION } from 'providers/EmergencyGovernanceProvider/helpers/eGov.consts'
import { COLON_VIEW } from 'app/App.components/Timer/Timer.view'
import colors from 'styles/colors'

// types
import { useEGovContext } from 'providers/EmergencyGovernanceProvider/emergencyGovernance.provider'
import { EGovProposalType } from 'providers/EmergencyGovernanceProvider/emergencyGovernance.provider.types'

// view
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import Expand from 'app/App.components/Expand/Expand.view'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { VotingArea } from 'app/App.components/VotingArea/VotingArea.controller'
import { EGovActiveCardStyled } from './EGovCard.style'
import {
  SatelliteGovernanceCardDropDown,
  SatelliteGovernanceCardTitleTextGroup,
} from 'pages/SatelliteGovernance/SatelliteGovernanceCard/SatelliteGovernanceCard.style'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useDoormanContext } from 'providers/DoormanProvider/doorman.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

type Props = {
  proposal: EGovProposalType
}

export const EGovCard = ({ proposal }: Props) => {
  const { bug } = useToasterContext()
  const { totalStakedMvk } = useDoormanContext()
  const { userTokensBalances, userAddress } = useUserContext()
  const {
    config: { minStakedMvkRequiredToVote },
  } = useEGovContext()
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { emergencyGovernanceAddress },
    preferences: { themeSelected },
  } = useDappConfigContext()

  const {
    voters,
    isActive,
    status,
    totalSmvkVotes,
    smvkPercentageRequired,
    title,
    description,
    expirationTimestamp,
    startTimestamp,
    executed,
    executionTimestamp,
    proposerAddress,
  } = proposal

  const votingStatistic = useMemo(
    () => ({
      forVotesMVKTotal: totalSmvkVotes,
      unusedVotesMVKTotal: totalStakedMvk,
      quorum: smvkPercentageRequired,
    }),
    [smvkPercentageRequired, totalSmvkVotes, totalStakedMvk],
  )

  const isUserVoter = voters.find(({ voterAddress }) => userAddress === voterAddress)
  const userSmvkAmount = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS })

  const voteForEGovProposalProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: VOTE_FOR_EGOV_PROPOSAL_ACTION,
      actionFn: async () => {
        try {
          if (!userAddress) {
            bug('Click Connect in the left menu', 'Please connect your wallet')
            return null
          }

          if (!emergencyGovernanceAddress) {
            bug('Wrong evergency governance address')
            return null
          }

          return await voteForEGovProposal(emergencyGovernanceAddress)
        } catch (e) {
          console.error('voteForEGovProposal', e)
          return null
        }
      },
    }),
    [emergencyGovernanceAddress, userAddress],
  )

  const { action: handleEGovProposalVote } = useContractAction(voteForEGovProposalProps)

  return isActive ? (
    <EGovActiveCardStyled>
      <h2>{title}</h2>
      <div className="voting-ends">
        Voting ends in{' '}
        <Timer
          timestamp={dayjs(expirationTimestamp).valueOf()}
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
          <div className="descr">{description}</div>
        </div>
        <VotingArea
          voteStatistics={votingStatistic}
          isVotingActive={true}
          disableVotingButtons={!isUserVoter || userSmvkAmount < minStakedMvkRequiredToVote || isActionActive}
          handleVote={handleEGovProposalVote}
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
            <p className="value">{title}</p>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3 className="name">Date</h3>
            <p className="value capitallize">
              {parseDate({
                time: dayjs(startTimestamp).valueOf(),
                timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC',
              })}
            </p>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <h3 className="name">Proposer</h3>
            <div className="value">
              <TzAddress tzAddress={proposerAddress} hasIcon />
            </div>
          </SatelliteGovernanceCardTitleTextGroup>
        </>
      }
      sufix={<StatusFlag className="expand-gov-status" status={status} text={status} />}
    >
      <SatelliteGovernanceCardDropDown>
        <div className="left">
          <h3>Description</h3>
          <p>{description}</p>
        </div>
        <div className="voting-block">
          <h3>Vote Statistics</h3>
          <b className="voting-ends">
            Voting ended on{' '}
            {parseDate({
              time: executed ? executionTimestamp : expirationTimestamp,
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

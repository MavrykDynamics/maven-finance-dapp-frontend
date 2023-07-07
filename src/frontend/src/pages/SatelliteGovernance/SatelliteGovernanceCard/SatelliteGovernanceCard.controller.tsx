import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'

import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { getSeparateSnakeCase } from '../../../utils/parse'
import { ProposalStatus, SatelliteGovernance } from '../../../utils/TypesAndInterfaces/Governance'
import Expand from '../../../app/App.components/Expand/Expand.view'

import { dropAction, voteForAction } from '../SatelliteGovernance.actions'

import {
  SatelliteGovernanceCardDropDown,
  SatelliteGovernanceCardPurposeBlock,
  SatelliteGovernanceCardTitleTextGroup,
  SatelliteGovernanceCardVotingBlock,
} from './SatelliteGovernanceCard.style'
import { VotingArea } from 'app/App.components/VotingArea/VotingArea.controller'
import { PRECISION_NUMBER } from 'utils/constants'
import { parseDate } from 'utils/time'
import { StatusFlagKind } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

type Props = {
  satelliteId: string
  initiatorId: string
  actionExpirationDate: string | null
  actionStartDate: string | null
  statusFlag: StatusFlagKind
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
  actionExpirationDate,
  actionStartDate,
  statusFlag,
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

  const myVote = useMemo(() => votes.find((item) => item.voterId === accountPkh)?.vote, [accountPkh, votes])
  const isEndingVotingTime = dayjs().diff(actionExpirationDate) < 0

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

  const handleVotingRoundVote = (type: string) => {
    dispatch(voteForAction(id, type))
  }

  const handleDropAction = async () => {
    await dispatch(dropAction(id))
  }

  return (
    <Expand
      className="expand-governance"
      header={
        <>
          <SatelliteGovernanceCardTitleTextGroup>
            <div className="name">Date</div>
            <div className="value">{parseDate({ time: actionStartDate, timeFormat: 'MMM Do, YYYY' })}</div>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <div className="name">Action</div>
            <div className="value capitallize">{getSeparateSnakeCase(governanceType)}</div>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <div className="name">Target</div>
            <div className="value">
              <TzAddress tzAddress={satelliteId} hasIcon={true} />
            </div>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <div className="name">Initiator</div>
            <div className="value">
              <TzAddress tzAddress={initiatorId} hasIcon={true} />
            </div>
          </SatelliteGovernanceCardTitleTextGroup>
        </>
      }
      sufix={<StatusFlag className="expand-gov-status" status={statusFlag} text={statusFlag} />}
    >
      <SatelliteGovernanceCardDropDown>
        <SatelliteGovernanceCardPurposeBlock>
          <div>
            <h3>Purpose</h3>
            <p className="purpose">{purpose}</p>

            {initiatorId ? (
              <Link className="profile-details" to={`/satellites/satellite-details/${satelliteId}`}>
                Profile Details
              </Link>
            ) : null}
          </div>

          {statusFlag === ProposalStatus.ONGOING && accountPkh === initiatorId ? (
            <div className="btn-wrapper">
              <Button kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={handleDropAction} disabled={isActionActive}>
                <Icon id="navigation-menu_close" />
                Drop Action
              </Button>
            </div>
          ) : null}
        </SatelliteGovernanceCardPurposeBlock>

        <SatelliteGovernanceCardVotingBlock>
          <h3>Vote Statistics</h3>
          <b className="voting-ends">
            Voting {!isEndingVotingTime ? 'ended' : 'ending'} on{' '}
            {parseDate({ time: actionExpirationDate, timeFormat: 'MMM DD, HH:mm' })} CEST
          </b>

          <VotingArea
            voteStatistics={voteStatistic}
            isVotingActive={statusFlag === ProposalStatus.ONGOING}
            handleVote={handleVotingRoundVote}
            disableVotingButtons={isActionActive}
            disableButtonByVote={myVote}
          />
        </SatelliteGovernanceCardVotingBlock>
      </SatelliteGovernanceCardDropDown>
    </Expand>
  )
}

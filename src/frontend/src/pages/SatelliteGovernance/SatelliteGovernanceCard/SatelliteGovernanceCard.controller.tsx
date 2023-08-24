import dayjs from 'dayjs'
import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'

// components
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import Expand from '../../../app/App.components/Expand/Expand.view'
import { VotingArea } from 'app/App.components/VotingArea/VotingArea.controller'

// actions
import { dropAction, voteForAction } from 'providers/SatellitesGovernanceProvider/actions/satellitesGov.actions'

// utils
import { getSeparateSnakeCase } from '../../../utils/parse'
import { parseDate } from 'utils/time'

// styles
import {
  SatelliteGovernanceCardDropDown,
  SatelliteGovernanceCardPurposeBlock,
  SatelliteGovernanceCardTitleTextGroup,
  SatelliteGovernanceCardVotingBlock,
} from './SatelliteGovernanceCard.style'

// consts
import { DROP_ACTION, VOTE_FOR_ACTION } from 'providers/SatellitesGovernanceProvider/helpers/satellitesGov.consts'
import { PRECISION_NUMBER } from 'utils/constants'
import { StatusFlagKind } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import { BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// types
import { SatelliteGovNormalizerReturnType } from 'providers/SatellitesGovernanceProvider/satelliteGovernance.provider.types'

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
  accountPkh: string | null
  isActionActive: boolean
  votes: SatelliteGovNormalizerReturnType['satelliteGovIdsMapper'][0]['votes']
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
  const {
    contractAddresses: { governanceSatelliteAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

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

  //   voteFor action ---------------------------------------------------------------------------
  const voteForActionFn = useCallback(
    async (type: string) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }
      if (!governanceSatelliteAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }

      return await voteForAction(governanceSatelliteAddress, id, type)
    },
    [bug, governanceSatelliteAddress, id, userAddress],
  )

  const voteForContratActionProps: HookContractActionArgs<string> = useMemo(
    () => ({
      actionType: VOTE_FOR_ACTION,
      actionFn: voteForActionFn,
    }),
    [voteForActionFn],
  )

  const { actionWithArgs: voteForActionHandler } = useContractAction(voteForContratActionProps)

  //   drop action ---------------------------------------------------------------------------
  const dropActionFn = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!governanceSatelliteAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    return await dropAction(governanceSatelliteAddress, id)
  }, [bug, governanceSatelliteAddress, id, userAddress])

  const dropContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DROP_ACTION,
      actionFn: dropActionFn,
    }),
    [dropActionFn],
  )

  const { action: dropActionHandler } = useContractAction(dropContratActionProps)

  const handleVotingRoundVote = async (type: string) => {
    await voteForActionHandler(type)
  }

  const handleDropAction = async () => {
    await dropActionHandler()
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
              <TzAddress tzAddress={satelliteId} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon={true} />
            </div>
          </SatelliteGovernanceCardTitleTextGroup>
          <SatelliteGovernanceCardTitleTextGroup>
            <div className="name">Initiator</div>
            <div className="value">
              <TzAddress tzAddress={initiatorId} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon={true} />
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

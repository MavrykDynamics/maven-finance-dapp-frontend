import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// consts, helpers, actions
import { DOWN, WARNING } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { getOracleStatus, getVoteText, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { ACTION_PRIMARY, ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'
import { delegate, undelegate } from '../Satellites.actions'
import { rewardsCompound } from 'pages/Doorman/Doorman.actions'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

// types
import { State } from 'reducers'
import { SatelliteStatus, SatelliteRecordType } from 'utils/TypesAndInterfaces/Satellites'

//styles
import { AvatarStyle } from 'app/App.components/Avatar/Avatar.style'
import {
  SatelliteCard,
  SatelliteCardInner,
  SideBySideImageAndText,
  SatelliteProfileImageContainer,
  SatelliteProfileImage,
  SatelliteTextGroup,
  SatelliteMainText,
  SatelliteProfileDetails,
  SatelliteCardTopRow,
  SatelliteSubText,
  SatelliteOracleStatusComponent,
  SatelliteCardButtons,
  SatelliteCardRow,
} from './SatelliteCard.style'

type SatelliteListItemProps = {
  satellite: SatelliteRecordType
  isDetailsPage?: boolean
  userHasSatelliteRewards?: boolean
  className?: string
  children?: JSX.Element
}

const renderVotingHistoryItem = (vote: number) => {
  const voteText = getVoteText(vote)
  return <span className={`voting-${voteText.toLowerCase()}`}>{voteText.toUpperCase()}</span>
}

export const SatelliteListItem = ({ satellite, isDetailsPage = false, children }: SatelliteListItemProps) => {
  const dispatch = useDispatch()

  const { feedsLedger } = useSelector((state: State) => state.dataFeeds)
  const {
    accountPkh,
    user: {
      isSatellite,
      mySMvkTokenBalance,
      satelliteMvkIsDelegatedTo,
      mySatelliteRewardsData: { myAvailableSatelliteRewards },
    },
  } = useSelector((state: State) => state.wallet)
  const {
    governanceStorage: { proposalLedger },
  } = useSelector((state: State) => state.governance)

  // Card buttons handlers
  const delegateCallback = () => dispatch(delegate(satellite.address))
  const undelegateCallback = () => dispatch(undelegate(satellite.address))
  const claimRewardsCallback = () => (accountPkh ? dispatch(rewardsCompound(accountPkh)) : null)

  const freesMVKSpace = Math.max(satellite.sMvkBalance * satellite.delegationRatio - satellite.totalDelegatedAmount, 0)
  const isUserDelegatedToThisSatellite = satellite.address === satelliteMvkIsDelegatedTo
  const balanceOver1SMvk = mySMvkTokenBalance >= 1

  // Latest vote data
  const currentlySupportingProposalVote = satellite.proposalVotingHistory?.at(0)?.vote ?? null
  const currentlySupportingProposalId = satellite.proposalVotingHistory?.at(0)?.proposalId ?? null
  const currentlySupportingProposal = proposalLedger?.length
    ? proposalLedger.find((proposal) => proposal.id === currentlySupportingProposalId)
    : null

  // Satellite status data
  const oracleStatusType = getOracleStatus(satellite, feedsLedger)
  const satelliteStatusColor = satellite.status === SatelliteStatus.BANNED ? DOWN : WARNING
  const isSatelliteInactive = satellite.status !== SatelliteStatus.ACTIVE

  const participation =
    (satellite.satelliteMetrics.proposalParticipation + satellite.satelliteMetrics.votingPartisipation) / 2

  const buttonToShow = isUserDelegatedToThisSatellite ? (
    <>
      <Button
        text="Undelegate"
        icon="man-close"
        kind={ACTION_SECONDARY}
        onClick={undelegateCallback}
        disabled={!accountPkh}
      />
      {isDetailsPage && myAvailableSatelliteRewards > 0 ? (
        <Button
          text="Claim Rewards"
          icon="rewards"
          kind={ACTION_PRIMARY}
          onClick={claimRewardsCallback}
          disabled={!accountPkh}
          strokeWidth={0.3}
        />
      ) : null}
    </>
  ) : (
    <Button
      text="Delegate"
      icon="man-check"
      kind={ACTION_PRIMARY}
      onClick={delegateCallback}
      disabled={!accountPkh || !balanceOver1SMvk}
    />
  )

  return (
    <SatelliteCard key={String(`satellite${satellite.address}`)}>
      <SatelliteCardInner>
        <div className="rows-wrapper">
          <div>
            <SideBySideImageAndText>
              <SatelliteProfileImageContainer>
                <AvatarStyle>
                  <SatelliteProfileImage src={satellite.image} />
                </AvatarStyle>
              </SatelliteProfileImageContainer>

              <SatelliteTextGroup>
                <SatelliteMainText>{satellite.name}</SatelliteMainText>
                <TzAddress tzAddress={satellite.address} type={BLUE} hasIcon={true} isBold={true} />
              </SatelliteTextGroup>
            </SideBySideImageAndText>

            {!isDetailsPage ? (
              <SatelliteProfileDetails>
                <Link to={`/satellites/satellite-details/${satellite.address}`}>
                  <Button text={'Profile Details'} icon="man" kind="transparent" />
                </Link>
              </SatelliteProfileDetails>
            ) : null}
          </div>

          <SatelliteCardTopRow isExtendedListItem={isDetailsPage}>
            <SatelliteTextGroup>
              <SatelliteMainText>Delegated MVK</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={satellite.totalDelegatedAmount + satellite.sMvkBalance} />
              </SatelliteSubText>
            </SatelliteTextGroup>

            {isDetailsPage ? (
              <SatelliteTextGroup>
                <SatelliteMainText>Your delegated MVK</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={isUserDelegatedToThisSatellite ? mySMvkTokenBalance : 0} />
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : null}

            <SatelliteTextGroup>
              <SatelliteMainText>Free sMVK Space</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={freesMVKSpace} />
              </SatelliteSubText>
            </SatelliteTextGroup>

            {isDetailsPage ? (
              <SatelliteTextGroup>
                <SatelliteMainText>Fee</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={satellite.satelliteFee} endingText="%" />
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : null}

            <SatelliteTextGroup>
              <SatelliteMainText>Participation</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={participation} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>

            {!satellite.oracleRecords.length ? (
              <SatelliteTextGroup>
                <SatelliteMainText># Delegators</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={satellite.delegatorCount} showDecimal={false} />
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : null}

            {satellite.oracleRecords.length ? (
              <SatelliteTextGroup className="oracle-status">
                <SatelliteMainText>Oracle Status</SatelliteMainText>
                <SatelliteSubText>
                  <SatelliteOracleStatusComponent statusType={oracleStatusType}>
                    {ORACLE_STATUSES_MAPPER[oracleStatusType]}
                  </SatelliteOracleStatusComponent>
                </SatelliteSubText>
              </SatelliteTextGroup>
            ) : null}
          </SatelliteCardTopRow>
        </div>

        <SatelliteCardButtons>
          {isSatelliteInactive && (
            <div>
              <StatusFlag status={satelliteStatusColor} text={SatelliteStatus[satellite.status]} />
            </div>
          )}

          {!isSatelliteInactive && !isSatellite && buttonToShow}
        </SatelliteCardButtons>
      </SatelliteCardInner>

      {children
        ? children
        : currentlySupportingProposal?.id !== undefined &&
          currentlySupportingProposalVote !== null && (
            <SatelliteCardRow>
              <div>
                Voted {renderVotingHistoryItem(currentlySupportingProposalVote)} on current Proposal{' '}
                {currentlySupportingProposal.id} - {currentlySupportingProposal.title}
              </div>
            </SatelliteCardRow>
          )}
    </SatelliteCard>
  )
}

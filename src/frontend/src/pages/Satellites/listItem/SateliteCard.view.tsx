import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// consts, helpers, actions
import { DOWN, WARNING } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { getOracleStatus, getVoteText, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import {
  ACTION_PRIMARY,
  ACTION_SECONDARY,
  BUTTON_WIDE,
  BUTTON_PRIMARY,
} from 'app/App.components/Button/Button.constants'
import { delegate, undelegate, distributeProposalRewards } from '../Satellites.actions'
import { rewardsCompound } from 'pages/Doorman/Doorman.actions'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'

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
import { SMVK_TOKEN_SYMBOL } from 'reducers/actions/user.actions'

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
  const { isActionActive } = useSelector((state: State) => state.loading)
  const {
    accountPkh,
    user: { isSatellite, userTokens, satelliteMvkIsDelegatedTo, availableSatellitesRewards },
  } = useSelector((state: State) => state.wallet)
  const { proposalsMapper } = useSelector((state: State) => state.governance)

  // Card buttons handlers
  const delegateCallback = async () => await dispatch(delegate(satellite.address))
  const undelegateCallback = async () => await dispatch(undelegate(satellite.address))
  const claimRewardsCallback = async () => (accountPkh ? await dispatch(rewardsCompound(accountPkh)) : null)
  // TODO: add valid data
  const distributeRewardsCallback = async () => await dispatch(distributeProposalRewards('', []))

  const freesMVKSpace = Math.max(satellite.sMvkBalance * satellite.delegationRatio - satellite.totalDelegatedAmount, 0)
  const isUserDelegatedToThisSatellite = satellite.address === satelliteMvkIsDelegatedTo
  const balanceOver1SMvk = userTokens[SMVK_TOKEN_SYMBOL].balance >= 1
  const { currentlyRegistered } = satellite

  // Latest vote data
  const currentlySupportingProposalVote = satellite.proposalVotingHistory?.at(0)?.vote ?? null
  const lastSupportedgProposalId = satellite.proposalVotingHistory?.at(0)?.proposalId ?? null

  // Satellite status data
  const oracleStatusType = getOracleStatus(satellite, feedsLedger)
  const satelliteStatusColor = satellite.status === SatelliteStatus.BANNED ? DOWN : WARNING
  const isSatelliteInactive = satellite.status !== SatelliteStatus.ACTIVE

  const participation =
    (satellite.satelliteMetrics.proposalParticipation + satellite.satelliteMetrics.votingPartisipation) / 2

  const buttonToShow =
    isUserDelegatedToThisSatellite && currentlyRegistered ? (
      <>
        <Button
          text="Undelegate"
          icon="man-close"
          kind={ACTION_SECONDARY}
          onClick={undelegateCallback}
          disabled={!accountPkh || isActionActive}
        />
        {isDetailsPage && availableSatellitesRewards > 0 ? (
          <Button
            text="Claim Rewards"
            icon="rewards"
            kind={ACTION_PRIMARY}
            onClick={claimRewardsCallback}
            disabled={!accountPkh || isActionActive}
            strokeWidth={0.3}
          />
        ) : null}
        {isDetailsPage && (
          <NewButton
            kind={BUTTON_PRIMARY}
            form={BUTTON_WIDE}
            onClick={distributeRewardsCallback}
            // TODO:  we are waiting new Query for getting proposals
            disabled={true || availableSatellitesRewards === 0 || isActionActive}
          >
            <Icon id="commision" />
            Distribute Rewards
          </NewButton>
        )}
      </>
    ) : (
      <Button
        text="Delegate"
        icon="man-check"
        kind={ACTION_PRIMARY}
        onClick={delegateCallback}
        disabled={!accountPkh || !balanceOver1SMvk || isActionActive}
      />
    )

  return (
    <SatelliteCard key={String(`satellite${satellite.address}`)}>
      <SatelliteCardInner isExtendedListItem={isDetailsPage}>
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
              <SatelliteMainText>Fee</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={satellite.satelliteFee} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>

            <SatelliteTextGroup>
              <SatelliteMainText>Free sMVK Space</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={freesMVKSpace} />
              </SatelliteSubText>
            </SatelliteTextGroup>

            <SatelliteTextGroup>
              <SatelliteMainText>Participation</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={participation} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>

            <SatelliteTextGroup className="oracle-status">
              <SatelliteMainText>Oracle Status</SatelliteMainText>
              <SatelliteSubText>
                <SatelliteOracleStatusComponent statusType={oracleStatusType}>
                  {ORACLE_STATUSES_MAPPER[oracleStatusType]}
                </SatelliteOracleStatusComponent>
              </SatelliteSubText>
            </SatelliteTextGroup>
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
        : lastSupportedgProposalId &&
          proposalsMapper[lastSupportedgProposalId] &&
          currentlySupportingProposalVote !== null && (
            <SatelliteCardRow>
              <div>
                Voted {renderVotingHistoryItem(currentlySupportingProposalVote)} on current Proposal{' '}
                {lastSupportedgProposalId} - {proposalsMapper[lastSupportedgProposalId].title}
              </div>
            </SatelliteCardRow>
          )}
    </SatelliteCard>
  )
}

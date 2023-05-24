import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// consts, helpers, actions
import { DOWN, WARNING } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { getVoteText, ORACLE_STATUSES_MAPPER } from 'providers/SatellitesProvider/satellites.const'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import {
  ACTION_PRIMARY,
  ACTION_SECONDARY,
  BUTTON_WIDE,
  BUTTON_PRIMARY,
  BUTTON_SIMPLE,
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
import { SatelliteStatus } from 'utils/TypesAndInterfaces/Satellites'
import { SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'

//styles
import { AvatarStyle } from 'app/App.components/Avatar/Avatar.style'
import {
  SatelliteCard,
  SatelliteCardInner,
  SatelliteProfileImageContainer,
  SatelliteProfileImage,
  SatelliteTextGroup,
  SatelliteMainText,
  SatelliteProfileDetails,
  SatelliteSubText,
  SatelliteOracleStatusComponent,
  SatelliteCardButtons,
  SatelliteCardRow,
} from './SatelliteCard.style'
import { SMVK_TOKEN_SYMBOL } from 'utils/constants'

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
  const satelliteStatusColor = satellite.status === SatelliteStatus.BANNED || !currentlyRegistered ? DOWN : WARNING
  // if satellite is unregistered, show inactive status
  const isSatelliteInactive = satellite.status !== SatelliteStatus.ACTIVE || !currentlyRegistered

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
        <div className="grid-container">
          <div className="grid-item">
            <SatelliteProfileImageContainer>
              <AvatarStyle>
                <SatelliteProfileImage src={satellite.image} />
              </AvatarStyle>
            </SatelliteProfileImageContainer>

            <SatelliteTextGroup>
              <SatelliteMainText>{satellite.name}</SatelliteMainText>
              <SatelliteSubText>
                <TzAddress tzAddress={satellite.address} type={BLUE} hasIcon isBold />
              </SatelliteSubText>
            </SatelliteTextGroup>
          </div>

          <div className="grid-item">
            <SatelliteTextGroup>
              <SatelliteMainText>Fee</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={satellite.satelliteFee} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>
          </div>
          <div className="grid-item">
            <SatelliteTextGroup>
              <SatelliteMainText>Free sMVK Space</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={freesMVKSpace} />
              </SatelliteSubText>
            </SatelliteTextGroup>
          </div>

          <div className="grid-item grid-item-replaceable">
            {!isDetailsPage ? (
              <SatelliteProfileDetails>
                <Link to={`/satellites/satellite-details/${satellite.address}`}>
                  <NewButton kind={BUTTON_SIMPLE}>
                    <Icon id="man" className="icon" />
                    <span>Profile Details</span>
                  </NewButton>
                </Link>
              </SatelliteProfileDetails>
            ) : (
              <SatelliteTextGroup>
                <SatelliteMainText>Total Voting Power</SatelliteMainText>
                <SatelliteSubText>
                  <CommaNumber value={satellite.sMvkBalance + satellite.totalDelegatedAmount} endingText="sMVK" />
                </SatelliteSubText>
              </SatelliteTextGroup>
            )}
          </div>

          <div className="grid-item">
            <SatelliteTextGroup>
              <SatelliteMainText>Participation</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={participation} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>
          </div>
          <div className="grid-item">
            <SatelliteTextGroup className="oracle-status">
              <SatelliteMainText>Oracle Status</SatelliteMainText>
              <SatelliteSubText>
                <SatelliteOracleStatusComponent statusType={satellite.oracleStatus}>
                  {ORACLE_STATUSES_MAPPER[satellite.oracleStatus]}
                </SatelliteOracleStatusComponent>
              </SatelliteSubText>
            </SatelliteTextGroup>
          </div>
        </div>

        <SatelliteCardButtons>
          {isSatelliteInactive && (
            <div>
              <StatusFlag status={satelliteStatusColor} text={SatelliteStatus[SatelliteStatus.INACTIVE]} />
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

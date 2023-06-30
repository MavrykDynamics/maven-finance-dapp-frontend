import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// context, hooks
import { useSatelliteOracleStatus } from 'providers/SatellitesProvider/hooks/useSatelliteStatus'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

// actions
import { delegate, undelegate, distributeProposalRewards } from '../Satellites.actions'
import { rewardsCompound } from 'pages/Doorman/Doorman.actions'

// consts
import { getVoteText, ORACLE_STATUSES_MAPPER } from 'providers/SatellitesProvider/satellites.const'
import colors from 'styles/colors'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { STATUS_FLAG_DOWN, STATUS_FLAG_WARNING } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import {
  ACTION_PRIMARY,
  ACTION_SECONDARY,
  BUTTON_WIDE,
  BUTTON_PRIMARY,
  BUTTON_SIMPLE,
} from 'app/App.components/Button/Button.constants'
import { TOTAL_VOTING_POWER_TOOLTIP_TEXT } from 'texts/tooltips/satellite'

// helpers
import { getSatelliteParticipations } from 'providers/SatellitesProvider/helpers/satellites.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// types
import { State } from 'reducers'
import {
  ACTIVE_SATELLITE_STATUS,
  BANNED_SATELLITE_STATUS,
  SatelliteRecordType,
  SatelliteStatuses,
} from 'providers/SatellitesProvider/satellites.provider.types'

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
  const { userTokensBalances, isSatellite, satelliteMvkIsDelegatedTo, availableSatellitesRewards, userAddress } =
    useUserContext()
  const { eGovProposalsAmount, proposalsAmount, executedProposalAmount, finRequestsAmount } = useSatellitesContext()

  const { oracleStatus, satelliteStatus } = useSatelliteOracleStatus(satellite)

  const { proposalParticipation, votingPartisipation } = getSatelliteParticipations({
    satellite,
    eGovProposalsAmount,
    proposalsAmount,
    executedProposalAmount,
    finRequestsAmount,
  })

  const dispatch = useDispatch()

  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const {
    currentlyRegistered,
    sMvkBalance,
    delegationRatio,
    totalDelegatedAmount,
    address: satelliteAddress,
  } = satellite

  const freesMVKSpace = Math.max(sMvkBalance * delegationRatio - totalDelegatedAmount, 0)
  const isUserDelegatedToThisSatellite = satelliteAddress === satelliteMvkIsDelegatedTo
  const balanceOver1SMvk = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS }) >= 1
  const isSatelliteInactive = !currentlyRegistered || satelliteStatus !== SatelliteStatuses[ACTIVE_SATELLITE_STATUS]

  // Actions
  const delegateCallback = async () => await dispatch(delegate(satellite.address))
  const undelegateCallback = async () => await dispatch(undelegate(satellite.address))
  const claimRewardsCallback = async () => (userAddress ? await dispatch(rewardsCompound(userAddress)) : null)
  // TODO: add valid data
  const distributeRewardsCallback = async () => await dispatch(distributeProposalRewards('', []))

  const buttonToShow =
    isUserDelegatedToThisSatellite && currentlyRegistered ? (
      <>
        <Button
          text="Undelegate"
          icon="man-close"
          kind={ACTION_SECONDARY}
          onClick={undelegateCallback}
          disabled={!userAddress || isActionActive}
        />
        {isDetailsPage && availableSatellitesRewards > 0 ? (
          <Button
            text="Claim Rewards"
            icon="rewards"
            kind={ACTION_PRIMARY}
            onClick={claimRewardsCallback}
            disabled={!userAddress || isActionActive}
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
        disabled={!userAddress || !balanceOver1SMvk || isActionActive}
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
                <div className="text-wrapper">
                  <SatelliteMainText>Total Voting Power</SatelliteMainText>
                  <CustomTooltip
                    text={TOTAL_VOTING_POWER_TOOLTIP_TEXT}
                    iconId="info"
                    defaultStrokeColor={colors[themeSelected]['textColor']}
                  />
                </div>
                <SatelliteSubText>
                  <CommaNumber value={satellite.totalVotingPower} endingText="sMVK" />
                </SatelliteSubText>
              </SatelliteTextGroup>
            )}
          </div>

          <div className="grid-item">
            <SatelliteTextGroup>
              <SatelliteMainText>Participation</SatelliteMainText>
              <SatelliteSubText>
                <CommaNumber value={proposalParticipation + votingPartisipation} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>
          </div>
          <div className="grid-item">
            <SatelliteTextGroup className="oracle-status">
              <SatelliteMainText>Oracle Status</SatelliteMainText>
              <SatelliteSubText>
                <SatelliteOracleStatusComponent statusType={oracleStatus}>
                  {ORACLE_STATUSES_MAPPER[oracleStatus]}
                </SatelliteOracleStatusComponent>
              </SatelliteSubText>
            </SatelliteTextGroup>
          </div>
        </div>

        <SatelliteCardButtons>
          {isSatelliteInactive && (
            <div>
              <StatusFlag
                status={
                  satelliteStatus !== SatelliteStatuses[BANNED_SATELLITE_STATUS] || !currentlyRegistered
                    ? STATUS_FLAG_DOWN
                    : STATUS_FLAG_WARNING
                }
                text={satelliteStatus}
              />
            </div>
          )}

          {!isSatelliteInactive && !isSatellite && buttonToShow}
        </SatelliteCardButtons>
      </SatelliteCardInner>

      {children ? (
        children
      ) : satellite.lastVotedProposal ? (
        <SatelliteCardRow>
          <div>
            Voted {renderVotingHistoryItem(satellite.lastVotedProposal.vote)} on current Proposal{' '}
            {satellite.lastVotedProposal.proposalId} - {satellite.lastVotedProposal.proposalTitle}
          </div>
        </SatelliteCardRow>
      ) : null}
    </SatelliteCard>
  )
}

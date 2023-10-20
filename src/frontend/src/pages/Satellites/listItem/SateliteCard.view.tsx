import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'

// context, hooks
import { useSatelliteStatuses } from 'providers/SatellitesProvider/hooks/useSatelliteStatus'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

// consts
import colors from 'styles/colors'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { STATUS_FLAG_DOWN, STATUS_FLAG_WARNING } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import {
  BUTTON_WIDE,
  BUTTON_PRIMARY,
  BUTTON_SIMPLE,
  BUTTON_SECONDARY,
} from 'app/App.components/Button/Button.constants'
import { TOTAL_VOTING_POWER_TOOLTIP_TEXT } from 'texts/tooltips/satellite'

// helpers
import {
  getSatelliteParticipations,
  getStatusColorBasedOnOracleType,
} from 'providers/SatellitesProvider/helpers/satellites.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

// view
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import Icon from 'app/App.components/Icon/Icon.view'
import Button from 'app/App.components/Button/NewButton'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// types
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
import {
  ACTIVE_SATELLITE_STATUS,
  BANNED_SATELLITE_STATUS,
  DELEGATE_ACTION,
  DISTRIBUTE_PROPOSALS_REWARDS_ACTION,
  SATELLITE_ORACLE_STATUSES,
  SATELLITE_STATUSES,
  SATELLITE_VOTES_MAPPER,
  UNDELEGATE_ACTION,
} from 'providers/SatellitesProvider/satellites.const'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { delegate, undelegate } from 'providers/SatellitesProvider/actions/satellites.actions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { distributeProposalRewards } from 'providers/UserProvider/actions/user.actions'
import { useUserRewards } from 'providers/UserProvider/hooks/useUserRewards'

type SatelliteListItemProps = {
  satellite: SatelliteRecordType
  isDetailsPage?: boolean
  userHasSatelliteRewards?: boolean
  className?: string
  children?: JSX.Element
}

const SatelliteLastProposalVote = ({
  lastVotedProposal,
}: {
  lastVotedProposal: SatelliteRecordType['lastVotedProposal']
}) => {
  if (!lastVotedProposal)
    return (
      <SatelliteCardRow>
        <div>Has not voted this cycle</div>
      </SatelliteCardRow>
    )

  const { vote, proposalId, proposalTitle } = lastVotedProposal
  const voteText = SATELLITE_VOTES_MAPPER[vote]

  return (
    <SatelliteCardRow>
      <div>
        Voted <span className={`voting-${voteText.toLowerCase()}`}>{voteText.toUpperCase()}</span> on current Proposal{' '}
        {proposalId} – {proposalTitle}
      </div>
    </SatelliteCardRow>
  )
}

export const SatelliteListItem = ({ satellite, isDetailsPage = false, children }: SatelliteListItemProps) => {
  const { userTokensBalances, isSatellite: isUserSatellite, satelliteMvkIsDelegatedTo, userAddress } = useUserContext()
  const { availableProposalRewards } = useUserRewards()
  const { proposalsAmount, satelliteGovActionsAmount, finRequestsAmount } = useSatellitesContext()
  const {
    contractAddresses: { delegationAddress, mvkTokenAddress, governanceAddress },
    globalLoadingState: { isActionActive },
    preferences: { themeSelected },
  } = useDappConfigContext()
  const { bug } = useToasterContext()

  const { oracleStatus, satelliteStatus } = useSatelliteStatuses(satellite)

  const { proposalParticipation, votingPartisipation } = getSatelliteParticipations({
    satellite,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
  })

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
  const isSatelliteActive = satelliteStatus === ACTIVE_SATELLITE_STATUS && currentlyRegistered

  // Actions ---------------------------------------------------------

  // delegate action --------------
  const delegeteAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!delegationAddress) {
      bug('Wrong delegation address')
      return null
    }

    const mvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress })
    const sMvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS })

    if (mvkTokenBalance === 0) {
      bug('Unable to Delegate', 'Please buy MVK and stake it')
      return null
    }

    if (sMvkTokenBalance === 0) {
      bug('Unable to Delegate', 'Please stake your MVK')
      return null
    }

    return await delegate(userAddress, satelliteAddress, delegationAddress)
  }, [bug, delegationAddress, mvkTokenAddress, satelliteAddress, userAddress, userTokensBalances])

  const delegateContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DELEGATE_ACTION,
      actionFn: delegeteAction,
    }),
    [delegeteAction],
  )

  const { action: delegateCallback } = useContractAction(delegateContractActionProps)

  // undelegate action --------------
  const undelegeteAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!delegationAddress || !governanceAddress) {
      bug('Wrong contract address')
      return null
    }

    return await undelegate(
      userAddress,
      availableProposalRewards,
      satelliteAddress,
      delegationAddress,
      governanceAddress,
    )
  }, [availableProposalRewards, bug, delegationAddress, governanceAddress, satelliteAddress, userAddress])

  const unDelegateContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UNDELEGATE_ACTION,
      actionFn: undelegeteAction,
    }),
    [undelegeteAction],
  )

  const { action: undelegateCallback } = useContractAction(unDelegateContractActionProps)

  // distributeRewards action
  const distributeRewardsAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!governanceAddress) {
      bug('Wrong governance address')
      return null
    }

    const satelliteAddressToDistribute = isUserSatellite ? userAddress : satelliteMvkIsDelegatedTo

    if (!satelliteAddressToDistribute) {
      bug('Wrong satellite address to distribute rewards')
      return null
    }

    return await distributeProposalRewards(governanceAddress, satelliteAddressToDistribute, availableProposalRewards)
  }, [userAddress, governanceAddress, isUserSatellite, satelliteMvkIsDelegatedTo, availableProposalRewards, bug])

  const distributeRewardsContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DISTRIBUTE_PROPOSALS_REWARDS_ACTION,
      actionFn: distributeRewardsAction,
    }),
    [distributeRewardsAction],
  )

  const { action: distributeRewardsCallback } = useContractAction(distributeRewardsContractActionProps)

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
                <TzAddress tzAddress={satellite.address} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon isBold />
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
                  <Button kind={BUTTON_SIMPLE}>
                    <Icon id="man" className="icon" />
                    <span>Profile Details</span>
                  </Button>
                </Link>
              </SatelliteProfileDetails>
            ) : (
              <SatelliteTextGroup>
                <div className="text-wrapper">
                  <SatelliteMainText>Total Voting Power</SatelliteMainText>
                  <CustomTooltip
                    text={TOTAL_VOTING_POWER_TOOLTIP_TEXT}
                    iconId="info"
                    defaultStrokeColor={colors[themeSelected].subHeadingText}
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
                <CommaNumber value={(proposalParticipation + votingPartisipation) / 2} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>
          </div>
          <div className="grid-item">
            <SatelliteTextGroup className="oracle-status">
              <SatelliteMainText>Oracle Status</SatelliteMainText>
              <SatelliteSubText>
                <SatelliteOracleStatusComponent>
                  <StatusFlag
                    status={getStatusColorBasedOnOracleType(oracleStatus)}
                    text={SATELLITE_ORACLE_STATUSES[oracleStatus]}
                  />
                </SatelliteOracleStatusComponent>
              </SatelliteSubText>
            </SatelliteTextGroup>
          </div>
        </div>

        <SatelliteCardButtons>
          {satelliteStatus !== ACTIVE_SATELLITE_STATUS && (
            <div>
              <StatusFlag
                status={satelliteStatus !== BANNED_SATELLITE_STATUS ? STATUS_FLAG_DOWN : STATUS_FLAG_WARNING}
                text={SATELLITE_STATUSES[satelliteStatus]}
              />
            </div>
          )}

          {/* Satellite action for user */}
          <>
            {/**
             * Delegate and Undelegate buttons (only 1 of them)
             * show on of them is current user is not satellite, cuz satellite can't delegate only be delegated, also is current card is for inactive satellite
             * such type of satellites can't be delegated
             *
             * Delegate button if user is not delegated to satellite on card, but it's disabled if user don't have smvk to delegate
             *
             * Undelegate button shown if user is delegated to satellite on card
             */}
            {isUserSatellite || !isSatelliteActive ? null : isUserDelegatedToThisSatellite ? (
              <Button kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={undelegateCallback} disabled={isActionActive}>
                <Icon id="man-close" />
                Undelegate
              </Button>
            ) : (
              <Button
                kind={BUTTON_PRIMARY}
                form={BUTTON_WIDE}
                onClick={delegateCallback}
                disabled={isActionActive || !balanceOver1SMvk}
              >
                <Icon id="man-check" />
                Delegate
              </Button>
            )}

            {/**
             * Distribute Proposal Rewards show to regular user on card of satellite to who he has delegated, and satellite is active, and opened details page
             * button is active, when user have rewards from this satellite
             */}
            {!isUserSatellite && isUserDelegatedToThisSatellite && isSatelliteActive && isDetailsPage ? (
              <Button
                kind={BUTTON_PRIMARY}
                form={BUTTON_WIDE}
                onClick={distributeRewardsCallback}
                disabled={availableProposalRewards.length === 0}
              >
                <Icon id="loans" />
                Distribute Rewards
              </Button>
            ) : null}
          </>
        </SatelliteCardButtons>
      </SatelliteCardInner>

      {children ? children : <SatelliteLastProposalVote lastVotedProposal={satellite.lastVotedProposal} />}
    </SatelliteCard>
  )
}

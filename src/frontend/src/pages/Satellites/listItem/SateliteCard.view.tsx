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
import { SatelliteRecordType, SatelliteVoteType } from 'providers/SatellitesProvider/satellites.provider.types'

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
  INACTIVE_SATELLITE_STATUS,
  SATELLITE_ORACLE_STATUSES,
  SATELLITE_STATUSES,
  SATELLITE_VOTES_MAPPER,
  UNDELEGATE_ACTION,
} from 'providers/SatellitesProvider/satellites.const'
import { rewardsCompound } from 'providers/UserProvider/actions/user.actions'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { REWARDS_COMPOUND_ACTION } from 'providers/UserProvider/helpers/user.consts'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import {
  delegate,
  distributeProposalRewards,
  undelegate,
} from 'providers/SatellitesProvider/actions/satellites.actions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

type SatelliteListItemProps = {
  satellite: SatelliteRecordType
  isDetailsPage?: boolean
  userHasSatelliteRewards?: boolean
  className?: string
  children?: JSX.Element
}

const renderVotingHistoryItem = (vote: SatelliteVoteType) => {
  const voteText = SATELLITE_VOTES_MAPPER[vote]
  return <span className={`voting-${voteText.toLowerCase()}`}>{voteText.toUpperCase()}</span>
}

export const SatelliteListItem = ({ satellite, isDetailsPage = false, children }: SatelliteListItemProps) => {
  const { userTokensBalances, isSatellite, satelliteMvkIsDelegatedTo, availableSatellitesRewards, userAddress } =
    useUserContext()
  const { proposalsAmount, satelliteGovActionsAmount, finRequestsAmount } = useSatellitesContext()
  const {
    contractAddresses: { delegationAddress, doormanAddress, mvkTokenAddress },
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

    if (!delegationAddress) {
      bug('Wrong delegation address')
      return null
    }

    return await undelegate(userAddress, satelliteAddress, delegationAddress)
  }, [bug, delegationAddress, satelliteAddress, userAddress])

  const unDelegateContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UNDELEGATE_ACTION,
      actionFn: undelegeteAction,
    }),
    [undelegeteAction],
  )

  const { action: undelegateCallback } = useContractAction(unDelegateContractActionProps)

  // claim rewards action ------------
  // TODO check if it's right action name and method
  const claimRewardsAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!doormanAddress) {
      bug('Wrong doorman address')
      return null
    }

    return await rewardsCompound(userAddress, doormanAddress)
  }, [bug, doormanAddress, userAddress])

  const claimRewardsContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REWARDS_COMPOUND_ACTION,
      actionFn: claimRewardsAction,
    }),
    [claimRewardsAction],
  )

  const { action: claimRewardsCallback } = useContractAction(claimRewardsContractActionProps)

  // distributeRewards action

  const distributeRewardsAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!delegationAddress) {
      bug('Wrong delegation address')
      return null
    }

    return await distributeProposalRewards(delegationAddress, '', [])
  }, [bug, delegationAddress, userAddress])

  const distributeRewardsContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DISTRIBUTE_PROPOSALS_REWARDS_ACTION,
      actionFn: distributeRewardsAction,
    }),
    [distributeRewardsAction],
  )

  const { action: distributeRewardsCallback } = useContractAction(distributeRewardsContractActionProps)

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
                <CommaNumber value={(proposalParticipation + votingPartisipation) / 2} endingText="%" />
              </SatelliteSubText>
            </SatelliteTextGroup>
          </div>
          <div className="grid-item">
            <SatelliteTextGroup className="oracle-status">
              <SatelliteMainText>Oracle Status</SatelliteMainText>
              <SatelliteSubText>
                <SatelliteOracleStatusComponent statusType={oracleStatus}>
                  {SATELLITE_ORACLE_STATUSES[oracleStatus]}
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

          {satelliteStatus !== INACTIVE_SATELLITE_STATUS && !isSatellite && buttonToShow}
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

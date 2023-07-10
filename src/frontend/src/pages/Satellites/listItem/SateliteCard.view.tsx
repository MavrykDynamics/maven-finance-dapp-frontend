import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// context, hooks
import { useSatelliteStatuses } from 'providers/SatellitesProvider/hooks/useSatelliteStatus'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

// consts
import colors from 'styles/colors'
import { MVK_TOKEN_SYMBOL, SMVK_TOKEN_ADDRESS } from 'utils/constants'
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
  SATELLITE_ORACLE_STATUSES,
  SATELLITE_STATUSES,
  SATELLITE_VOTES_MAPPER,
  UNDELEGATE_ACTION,
} from 'providers/SatellitesProvider/satellites.const'
import { rewardsCompound } from 'providers/UserProvider/actions/user.actions'
import { checkIfActionSuccess } from 'providers/DappConfigProvider/helpers/dappAction.helpers'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { REWARDS_COMPOUND_ACTION } from 'providers/UserProvider/helpers/user.consts'
import { sleep } from 'utils/api/sleep'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'
import { isContractErrorPayload } from 'errors/helpers/walletError.helper'
import { TezosWalletErrorPayload } from 'errors/error.type'
import { unknownToError } from 'errors/error'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import {
  delegate,
  distributeProposalRewards,
  undelegate,
} from 'providers/SatellitesProvider/actions/satellites.actions'

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
    setAction,
    contractAddresses: { delegationAddress, doormanAddress },
    preferences: { themeSelected },
  } = useDappConfigContext()
  const { bug, info, loading } = useToasterContext()

  const { oracleStatus, satelliteStatus } = useSatelliteStatuses(satellite)

  const { proposalParticipation, votingPartisipation } = getSatelliteParticipations({
    satellite,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
  })

  const dispatch = useDispatch()

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

  // Actions
  const delegateCallback = async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return
    }
    if (!delegationAddress) {
      bug('Wrong delegation address')
      return
    }

    const mvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: MVK_TOKEN_SYMBOL })
    const sMvkTokenBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS })

    if (mvkTokenBalance === 0) {
      bug('Unable to Delegate', 'Please buy MVK and stake it')
      return
    }

    if (sMvkTokenBalance === 0) {
      bug('Unable to Delegate', 'Please stake your MVK')
      return
    }

    try {
      const actionResult = await delegate(userAddress, satelliteAddress, delegationAddress)

      if (checkIfActionSuccess(actionResult)) {
        const { operation } = actionResult
        dispatch(toggleActionFullScreenLoader(true))
        dispatch(toggleActionCompletion(true))

        info(
          TOASTER_ACTIONS_TEXTS[DELEGATE_ACTION]['start']['message'],
          TOASTER_ACTIONS_TEXTS[DELEGATE_ACTION]['start']['title'],
        )

        await sleep(5000)

        // show toaster loader after 5000ms after operation started
        const toasterId = loading(
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
        )

        dispatch(toggleActionFullScreenLoader(false))
        dispatch(toggleActionCompletion(false))

        const operationConfirm = await operation.confirmation()
        const operationLvl = operationConfirm.block.header.level
        setAction({ actionName: DELEGATE_ACTION, toasterId, operationLvl })
      } else if (isContractErrorPayload(actionResult.error)) {
        const { message, description } = actionResult.error as TezosWalletErrorPayload
        bug(description, message)
      } else {
        throw new Error(actionResult.error?.message)
      }
    } catch (e) {
      setAction(null)
      const parsedError = unknownToError(e)
      bug(parsedError.message)
    }
  }

  const undelegateCallback = async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return
    }

    if (!delegationAddress) {
      bug('Wrong delegation address')
      return
    }

    try {
      const actionResult = await undelegate(userAddress, satelliteAddress, delegationAddress)

      if (checkIfActionSuccess(actionResult)) {
        const { operation } = actionResult
        dispatch(toggleActionFullScreenLoader(true))
        dispatch(toggleActionCompletion(true))

        info(
          TOASTER_ACTIONS_TEXTS[UNDELEGATE_ACTION]['start']['message'],
          TOASTER_ACTIONS_TEXTS[UNDELEGATE_ACTION]['start']['title'],
        )

        await sleep(5000)

        // show toaster loader after 5000ms after operation started
        const toasterId = loading(
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
        )

        dispatch(toggleActionFullScreenLoader(false))
        dispatch(toggleActionCompletion(false))

        const operationConfirm = await operation.confirmation()
        const operationLvl = operationConfirm.block.header.level
        setAction({ actionName: UNDELEGATE_ACTION, toasterId, operationLvl })
      } else if (isContractErrorPayload(actionResult.error)) {
        const { message, description } = actionResult.error as TezosWalletErrorPayload
        bug(description, message)
      } else {
        throw new Error(actionResult.error?.message)
      }
    } catch (e) {
      setAction(null)
      const parsedError = unknownToError(e)
      bug(parsedError.message)
    }
  }

  const claimRewardsCallback = async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return
    }
    if (!doormanAddress) {
      bug('Bad doorman address')
      return
    }

    try {
      const actionResult = await rewardsCompound(userAddress, doormanAddress)

      if (checkIfActionSuccess(actionResult)) {
        const { operation } = actionResult
        dispatch(toggleActionFullScreenLoader(true))
        dispatch(toggleActionCompletion(true))

        info(
          TOASTER_ACTIONS_TEXTS[REWARDS_COMPOUND_ACTION]['start']['message'],
          TOASTER_ACTIONS_TEXTS[REWARDS_COMPOUND_ACTION]['start']['title'],
        )

        await sleep(5000)

        // show toaster loader after 5000ms after operation started
        const toasterId = loading(
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
        )

        dispatch(toggleActionFullScreenLoader(false))
        dispatch(toggleActionCompletion(false))

        const operationConfirm = await operation.confirmation()
        const operationLvl = operationConfirm.block.header.level

        setAction({ actionName: REWARDS_COMPOUND_ACTION, toasterId, operationLvl })
      } else if (isContractErrorPayload(actionResult.error)) {
        const { message, description } = actionResult.error as TezosWalletErrorPayload
        bug(description, message)
      } else {
        throw new Error(actionResult.error.message)
      }
    } catch (e) {
      setAction(null)
      const parsedError = unknownToError(e)
      bug(parsedError.message)
    }
  }

  const distributeRewardsCallback = async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return
    }

    if (!delegationAddress) {
      bug('Wrong delegation address')
      return
    }

    // TODO: add valid data
    try {
      const actionResult = await distributeProposalRewards(delegationAddress, '', [])

      if (checkIfActionSuccess(actionResult)) {
        const { operation } = actionResult
        dispatch(toggleActionFullScreenLoader(true))
        dispatch(toggleActionCompletion(true))

        info(
          TOASTER_ACTIONS_TEXTS[DISTRIBUTE_PROPOSALS_REWARDS_ACTION]['start']['message'],
          TOASTER_ACTIONS_TEXTS[DISTRIBUTE_PROPOSALS_REWARDS_ACTION]['start']['title'],
        )

        await sleep(5000)

        // show toaster loader after 5000ms after operation started
        const toasterId = loading(
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
        )

        dispatch(toggleActionFullScreenLoader(false))
        dispatch(toggleActionCompletion(false))

        const operationConfirm = await operation.confirmation()
        const operationLvl = operationConfirm.block.header.level
        setAction({ actionName: DISTRIBUTE_PROPOSALS_REWARDS_ACTION, toasterId, operationLvl })
      } else if (isContractErrorPayload(actionResult.error)) {
        const { message, description } = actionResult.error as TezosWalletErrorPayload
        bug(description, message)
      } else {
        throw new Error(actionResult.error?.message)
      }
    } catch (e) {
      setAction(null)
      const parsedError = unknownToError(e)
      bug(parsedError.message)
    }
  }

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

          {satelliteStatus !== ACTIVE_SATELLITE_STATUS && !isSatellite && buttonToShow}
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

import { useEffect } from 'react'
import { Link } from 'react-router-dom'

// const
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITES_DATA_SINGLE_SUB,
  SATELLITE_DATA_SUB,
  SATELLITE_ORACLE_STATUSES,
  SATELLITE_PARTICIPATION_DATA_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import colors from 'styles/colors'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import { TOTAL_VOTING_POWER_TOOLTIP_TEXT } from 'texts/tooltips/satellite'

// helpers
import { useSatelliteStatuses } from 'providers/SatellitesProvider/hooks/useSatelliteStatus'
import {
  getSatelliteParticipations,
  getStatusColorBasedOnOracleType,
} from 'providers/SatellitesProvider/helpers/satellites.utils'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// view
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DashboardPersonalSatellitesBottomLinks, SatelliteStatusBlock } from './DashboardPersonalComponents.style'
import { DashboardCardHeader } from '../DashboardPersonal.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { UserActionHistory } from './UserOperationsHistory'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { SatelliteOracleStatusComponent } from 'pages/Satellites/listItem/SatelliteCard.style'

const SatelliteTab = ({
  distributeProposalRewards,
  availableProposalRewards,
}: {
  distributeProposalRewards: () => void
  availableProposalRewards: Array<number>
}) => {
  const { userAddress } = useUserContext()
  const {
    satelliteMapper,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
    setSatelliteAddressToSubsctibe,
    changeSatellitesSubscriptionsList,
    isLoading: isSatellitesLoading,
  } = useSatellitesContext()

  useEffect(() => {
    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: SATELLITES_DATA_SINGLE_SUB,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
    })

    return () => {
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
    }
  }, [])

  useEffect(() => {
    if (userAddress) {
      setSatelliteAddressToSubsctibe(userAddress)
    }
    return () => setSatelliteAddressToSubsctibe(null)
  }, [userAddress])

  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const satelliteRecord = userAddress ? satelliteMapper[userAddress] : null

  const { oracleStatus } = useSatelliteStatuses(satelliteRecord)
  const { proposalParticipation } = getSatelliteParticipations({
    satellite: satelliteRecord,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
  })

  return (
    <>
      <SatelliteStatusBlock>
        <DashboardCardHeader>
          <h2>My Satellite Details</h2>

          <NewButton
            kind={BUTTON_PRIMARY}
            form={BUTTON_WIDE}
            onClick={distributeProposalRewards}
            disabled={availableProposalRewards.length === 0}
          >
            <Icon id="loans" />
            Distribute Gov. Rewards
          </NewButton>
        </DashboardCardHeader>
        {userAddress && isSatellitesLoading ? (
          <DataLoaderWrapper margin="20px 0 0 0">
            <ClockLoader width={75} height={75} />
            <div className="text">Loading your satellite data</div>
          </DataLoaderWrapper>
        ) : satelliteRecord ? (
          <>
            <div className="container">
              <div className="grid-container">
                <div className="grid-item info">
                  <ImageWithPlug imageLink={satelliteRecord.image} alt={satelliteRecord.name + ' avatar'} />

                  <div className="text">
                    <div className="name">{satelliteRecord.name}</div>
                    <div className="value">
                      <TzAddress tzAddress={satelliteRecord.address} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
                    </div>
                  </div>
                </div>

                <div className="grid-item ">
                  <div className="name">Free MVK Space</div>
                  <div className="value">
                    <CommaNumber
                      value={Math.max(
                        satelliteRecord.sMvkBalance * satelliteRecord.delegationRatio -
                          satelliteRecord.totalDelegatedAmount,
                        0,
                      )}
                    />
                  </div>
                </div>
                <div className="grid-item ">
                  <div className="name">Gov. Participation</div>
                  <div className="value">
                    <CommaNumber value={proposalParticipation} endingText="%" />
                  </div>
                </div>
                <div className="grid-item ">
                  <div className="name">Delegated MVK</div>
                  <div className="value">
                    <CommaNumber value={satelliteRecord.totalDelegatedAmount} />
                  </div>
                </div>
                <div className="grid-item ">
                  <div className="name">Oracle Participation</div>
                  <div className="value">
                    <CommaNumber value={satelliteRecord.oracleEfficiency} endingText="%" />
                  </div>
                </div>

                <div className="grid-item grid-item-under-image">
                  <div className="text-wrapper">
                    <div className="name">Total Voting Power</div>
                    <CustomTooltip
                      text={TOTAL_VOTING_POWER_TOOLTIP_TEXT}
                      iconId="info"
                      defaultStrokeColor={colors[themeSelected].subHeadingText}
                    />
                  </div>
                  <div className="value">
                    <CommaNumber value={satelliteRecord.totalVotingPower} endingText="sMVK" />
                  </div>
                </div>
                <div className="grid-item ">
                  <div className="name">Fee</div>
                  <div className="value">
                    <CommaNumber value={satelliteRecord.satelliteFee} endingText="%" />
                  </div>
                </div>
                <div className="grid-item ">
                  <div className="name">Oracle Status</div>
                  <div className="value">
                    <SatelliteOracleStatusComponent>
                      <StatusFlag
                        status={getStatusColorBasedOnOracleType(oracleStatus)}
                        text={SATELLITE_ORACLE_STATUSES[oracleStatus]}
                      />
                    </SatelliteOracleStatusComponent>
                  </div>
                </div>
                <div className="grid-item grid-item-last">
                  <div className="name">Website</div>
                  <div className="value">
                    <a href={satelliteRecord.website}>View Website</a>
                  </div>
                </div>
              </div>
            </div>
            <DashboardPersonalSatellitesBottomLinks>
              <Link to="/become-satellite">Edit My Profile</Link>
              <Link to={`/satellites/satellite-details/${satelliteRecord.address}`}>View Satellite Profile</Link>
            </DashboardPersonalSatellitesBottomLinks>
          </>
        ) : (
          <div className="no-data">
            <span>No satellite data</span>
          </div>
        )}
      </SatelliteStatusBlock>

      <UserActionHistory />
    </>
  )
}

export default SatelliteTab

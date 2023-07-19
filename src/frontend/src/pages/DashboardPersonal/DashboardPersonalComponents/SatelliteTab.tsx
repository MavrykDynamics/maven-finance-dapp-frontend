import { useEffect } from 'react'
import { Link } from 'react-router-dom'

// const
import { SATELLITE_ORACLE_STATUSES } from 'providers/SatellitesProvider/satellites.const'
import colors from 'styles/colors'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { TOTAL_VOTING_POWER_TOOLTIP_TEXT } from 'texts/tooltips/satellite'

// context
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// helpers
import { useSatelliteStatuses } from 'providers/SatellitesProvider/hooks/useSatelliteStatus'
import { getSatelliteParticipations } from 'providers/SatellitesProvider/helpers/satellites.utils'

// view
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DashboardPersonalSatellitesBottomLinks, SatelliteStatusBlock } from './DashboardPersonalComponents.style'
import { SatelliteOracleStatusComponent } from 'pages/Satellites/listItem/SatelliteCard.style'
import { DashboardCardHeader } from '../DashboardPersonal.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { UserActionHistory } from './UserOperationsHistory'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'

const SatelliteTab = () => {
  const { userAddress, availableSatellitesRewards } = useUserContext()
  const {
    satelliteMapper,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
    setSatelliteAddressToSubsctibe,
  } = useSatellitesContext()

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

  // TODO: add valid data
  const handleDistributeRewards = () => {
    // TODO TAKE LOGIC FROM sATELLITEcARD COMPONENT FOR THIS CALLBACK FN
  }

  return (
    <>
      <SatelliteStatusBlock>
        <DashboardCardHeader>
          <h2>My Satellite Details</h2>

          <NewButton
            kind={BUTTON_PRIMARY}
            form={BUTTON_WIDE}
            onClick={handleDistributeRewards}
            // TODO:  we are waiting new Query for getting proposals
            disabled={true || availableSatellitesRewards === 0}
          >
            <Icon id="loans" />
            Distribute Gov. Rewards
          </NewButton>
        </DashboardCardHeader>
        {satelliteRecord ? (
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
                      defaultStrokeColor={colors[themeSelected]['subHeadingText']}
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
                    <SatelliteOracleStatusComponent statusType={oracleStatus}>
                      {SATELLITE_ORACLE_STATUSES[oracleStatus]}
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

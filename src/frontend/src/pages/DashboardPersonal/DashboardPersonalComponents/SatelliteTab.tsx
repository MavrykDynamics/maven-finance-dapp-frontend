import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { distributeProposalRewards } from 'pages/Satellites/Satellites.actions'

import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { DashboardPersonalSatellitesBottomLinks, SatelliteStatusBlock } from './DashboardPersonalComponents.style'
import { SatelliteOracleStatusComponent } from 'pages/Satellites/listItem/SatelliteCard.style'
import { DashboardCardHeader } from '../DashboardPersonal.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { State } from 'reducers'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { UserActionHistory } from './UserOperationsHistory'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import colors from 'styles/colors'
import { TOTAL_VOTING_POWER_TOOLTIP_TEXT } from 'texts/tooltips/satellite'

const SatelliteTab = () => {
  const dispatch = useDispatch()
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const {
    accountPkh = '',
    user: { availableSatellitesRewards },
  } = useSelector((state: State) => state.wallet)
  const { satelliteMapper } = useSelector((state: State) => state.satellites)

  const satelliteRecord = satelliteMapper[accountPkh]

  const handleDistributeRewards = () => {
    // TODO: add valid data
    dispatch(distributeProposalRewards('', []))
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
                      <TzAddress tzAddress={satelliteRecord.address} />
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
                    <CommaNumber value={satelliteRecord.satelliteMetrics.votingPartisipation} endingText="%" />
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
                    <CommaNumber value={satelliteRecord.satelliteMetrics.oracleEfficiency} endingText="%" />
                  </div>
                </div>

                <div className="grid-item grid-item-under-image">
                  <div className="text-wrapper">
                    <div className="name">Total Voting Power</div>
                    <CustomTooltip
                      text={TOTAL_VOTING_POWER_TOOLTIP_TEXT}
                      iconId="info"
                      defaultStrokeColor={colors[themeSelected]['textColor']}
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
                    <SatelliteOracleStatusComponent statusType={satelliteRecord.oracleStatus}>
                      {ORACLE_STATUSES_MAPPER[satelliteRecord.oracleStatus]}
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

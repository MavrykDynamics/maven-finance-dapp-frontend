import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { getOracleStatus, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { distributeProposalRewards } from 'pages/Satellites/Satellites.actions'

import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { SatelliteStatusBlock } from './DashboardPersonalComponents.style'
import { SatelliteOracleStatusComponent } from 'pages/Satellites/listItem/SatelliteCard.style'
import { DashboardCardHeader } from '../DashboardPersonal.style'

import { State } from 'reducers'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { UserActionHistory } from './UserOperationsHistory'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

const SatelliteTab = () => {
  const dispatch = useDispatch()
  const { feedsLedger } = useSelector((state: State) => state.dataFeeds)
  const {
    accountPkh = '',
    user: {
      availableSatellitesRewards: { myAvailableSatelliteRewards },
    },
  } = useSelector((state: State) => state.wallet)
  const { satelliteMapper } = useSelector((state: State) => state.satellites)

  const satelliteRecord = satelliteMapper[accountPkh]
  const oracleStatusType = getOracleStatus(satelliteRecord, feedsLedger)

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
            disabled={true || myAvailableSatelliteRewards === 0}
          >
            <Icon id="loans" />
            Distribute Gov. Rewards
          </NewButton>
        </DashboardCardHeader>
        {satelliteRecord ? (
          <>
            <div className="top-row">
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
            </div>
            <div className="bottom-row">
              <div className="grid-item ">
                <div className="name">Fee</div>
                <div className="value">
                  <CommaNumber value={satelliteRecord.satelliteFee} endingText="%" />
                </div>
              </div>
              <div className="grid-item ">
                <div className="name">Oracle Status</div>
                <div className="value">
                  <SatelliteOracleStatusComponent statusType={oracleStatusType}>
                    {ORACLE_STATUSES_MAPPER[oracleStatusType]}
                  </SatelliteOracleStatusComponent>
                </div>
              </div>
              <div className="grid-item ">
                <div className="name">Website</div>
                <div className="value">
                  <a href={satelliteRecord.website}>{satelliteRecord.website}</a>
                </div>
              </div>
            </div>
            <Link to="/become-satellite">Edit My Profile</Link>
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

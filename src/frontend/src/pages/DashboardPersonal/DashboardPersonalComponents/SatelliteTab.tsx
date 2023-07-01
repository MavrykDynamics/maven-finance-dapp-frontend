import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { distributeProposalRewards } from 'pages/Satellites/Satellites.actions'

import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { SatelliteStatusBlock } from './DashboardPersonalComponents.style'
import { SatelliteOracleStatusComponent } from 'pages/Satellites/listItem/SatelliteCard.style'
import { DashboardCardHeader } from '../DashboardPersonal.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

import { State } from 'reducers'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { UserActionHistory } from './UserOperationsHistory'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

import colors from 'styles/colors'
import { TOTAL_VOTING_POWER_TOOLTIP_TEXT } from 'texts/tooltips/satellite'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatelliteStatuses } from 'providers/SatellitesProvider/hooks/useSatelliteStatus'
import { SATELLITE_ORACLE_STATUSES } from 'providers/SatellitesProvider/satellites.provider.types'
import { getSatelliteParticipations } from 'providers/SatellitesProvider/helpers/satellites.utils'

const SatelliteTab = () => {
  const dispatch = useDispatch()

  const { userAddress, availableSatellitesRewards } = useUserContext()
  const { satelliteMapper, eGovProposalsAmount, proposalsAmount, executedProposalAmount, finRequestsAmount } =
    useSatellitesContext()

  const { themeSelected } = useSelector((state: State) => state.preferences)

  const satelliteRecord = userAddress ? satelliteMapper[userAddress] : null

  const { oracleStatus } = useSatelliteStatuses(satelliteRecord)
  const { proposalParticipation } = getSatelliteParticipations({
    satellite: satelliteRecord,
    eGovProposalsAmount,
    proposalsAmount,
    executedProposalAmount,
    finRequestsAmount,
  })

  // TODO: add valid data
  const handleDistributeRewards = () => dispatch(distributeProposalRewards('', []))

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
                    <SatelliteOracleStatusComponent statusType={oracleStatus}>
                      {SATELLITE_ORACLE_STATUSES[oracleStatus]}
                    </SatelliteOracleStatusComponent>
                  </div>
                </div>
                <div className="grid-item grid-item-last">
                  <div className="name">Website</div>
                  <div className="value">
                    <a href={satelliteRecord.website}>{satelliteRecord.website}</a>
                  </div>
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

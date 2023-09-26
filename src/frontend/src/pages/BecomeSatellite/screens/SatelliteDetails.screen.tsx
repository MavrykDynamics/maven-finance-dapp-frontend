import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { STATUS_FLAG_UP } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { SatelliteOracleStatusComponent } from 'pages/Satellites/listItem/SatelliteCard.style'
import { getStatusColorBasedOnOracleType } from 'providers/SatellitesProvider/helpers/satellites.utils'
import { SATELLITE_ORACLE_STATUSES } from 'providers/SatellitesProvider/satellites.const'
import React from 'react'
import { SatelliteDetailsContainer } from '../BecomeSatellite.style'
import { BlockName } from 'pages/Dashboard/Dashboard.style'
import { SatelliteMetrics, SatelliteMetricsBlock } from 'pages/SatelliteDetails/SatelliteDetails.style'

export const SatelliteDetailsScreen = () => {
  return (
    <SatelliteDetailsContainer>
      <div className="grid-container">
        <ThreeLevelListItem>
          <div className="name">Fee</div>
          <CommaNumber value={11} decimalsToShow={2} className="value" endingText="%" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Participation</div>
          <CommaNumber value={11} decimalsToShow={2} className="value" endingText="%" />
        </ThreeLevelListItem>

        <ThreeLevelListItem>
          <div className="name">Free sMVK Space</div>
          <CommaNumber value={11} decimalsToShow={2} className="value" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Oracle Status</div>
          <div className="value">
            <SatelliteOracleStatusComponent>
              <StatusFlag
                status={STATUS_FLAG_UP}
                // status={getStatusColorBasedOnOracleType(oracleStatus)}
                // text={SATELLITE_ORACLE_STATUSES[oracleStatus]}
                text={'Responded'}
              />
            </SatelliteOracleStatusComponent>
          </div>
        </ThreeLevelListItem>
      </div>
      <SatelliteMetrics>
        <div>
          <BlockName>Satellite metrics</BlockName>
          <SatelliteMetricsBlock>
            <h5>Proposal Participation</h5>
            <p>
              <CommaNumber value={11} endingText="%" showDecimal={false} />
            </p>
            <h5>Vote Participation</h5>
            <p>
              <CommaNumber value={11} endingText="%" showDecimal={false} />
            </p>
            <h5>Oracle Participation</h5>
            <p>
              <CommaNumber value={11} endingText="%" showDecimal={false} />
            </p>
          </SatelliteMetricsBlock>
        </div>

        <SatelliteMetricsBlock>
          <h5>Satellite’s sMVK</h5>
          <p>
            <CommaNumber value={11} showDecimal />
          </p>
          <h5># Delegators</h5>
          <p>
            <CommaNumber value={111} showDecimal={false} />
          </p>
          <h5># Oracle Feeds</h5>
          <p>
            <CommaNumber value={11} showDecimal={false} />
          </p>
        </SatelliteMetricsBlock>
      </SatelliteMetrics>
    </SatelliteDetailsContainer>
  )
}

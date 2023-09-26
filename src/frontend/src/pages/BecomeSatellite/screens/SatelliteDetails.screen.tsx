import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { STATUS_FLAG_UP } from 'app/App.components/StatusFlag/StatusFlag.constants'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { SatelliteOracleStatusComponent } from 'pages/Satellites/listItem/SatelliteCard.style'
import { getStatusColorBasedOnOracleType } from 'providers/SatellitesProvider/helpers/satellites.utils'
import { SATELLITE_ORACLE_STATUSES } from 'providers/SatellitesProvider/satellites.const'
import React, { useCallback, useState } from 'react'
import { SatelliteDetailsContainer } from '../BecomeSatellite.style'
import { BlockName } from 'pages/Dashboard/Dashboard.style'
import {
  SatelliteMetrics,
  SatelliteMetricsBlock,
  SatelliteVotingInfoWrapper,
} from 'pages/SatelliteDetails/SatelliteDetails.style'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { useSatelliteVotes } from 'providers/SatellitesProvider/hooks/useSatelliteVotes'
import { SatellitesVotingHistory } from 'pages/SatelliteDetails/SatelliteDetails.controller'
import Button from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { AddToAggregatorPopup } from '../popups/AddToAggregatorPopup'
import { SatelliteMapper } from 'providers/SatellitesProvider/satellites.provider.types'

type SatelliteDetailsScreenProps = {
  satelliteId: string
  usersSatelliteProfile: SatelliteMapper[0] | null
}
export const SatelliteDetailsScreen = ({ satelliteId, usersSatelliteProfile }: SatelliteDetailsScreenProps) => {
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { satelliteVotes, isLoading: isSatelliteVotesLoading } = useSatelliteVotes(satelliteId)
  const [showAggregatorPopup, setShowAggregatorPopup] = useState(false)

  const closePopup = useCallback(() => {
    setShowAggregatorPopup(false)
  }, [])

  const showPopup = useCallback(() => {
    setShowAggregatorPopup(true)
  }, [])

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
      <SatelliteMetrics className="mb-30">
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

      <SatelliteVotingInfoWrapper>
        <BlockName>Voting History</BlockName>
        {isSatelliteVotesLoading ? (
          <div className="loader">
            <SpinnerCircleLoaderStyled />
          </div>
        ) : (
          <SatellitesVotingHistory satelliteVotes={satelliteVotes} />
        )}
      </SatelliteVotingInfoWrapper>
      <div className="buttons-wrapper">
        <Button kind={BUTTON_PRIMARY} disabled={isActionActive} onClick={showPopup}>
          Register to a Aggregator Pair
        </Button>
      </div>

      <AddToAggregatorPopup
        satellite={usersSatelliteProfile}
        show={Boolean(usersSatelliteProfile) && showAggregatorPopup}
        closePopup={closePopup}
      />
    </SatelliteDetailsContainer>
  )
}

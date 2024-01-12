import React, { useCallback, useState } from 'react'

// components
import { SatellitesVotingHistory } from 'pages/SatelliteVotingHistory/SatelliteVotingHistory'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import Button from 'app/App.components/Button/NewButton'
import { AddToAggregatorPopup } from '../popups/AddToAggregatorPopup'

// styles
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { SatelliteOracleStatusComponent } from 'pages/Satellites/listItem/SatelliteCard.style'
import { SatelliteDetailsContainer } from '../BecomeSatellite.style'
import { BlockName } from 'pages/Dashboard/Dashboard.style'
import {
  SatelliteMetrics,
  SatelliteMetricsBlock,
  SatelliteVotingInfoWrapper,
} from 'pages/SatelliteDetails/SatelliteDetails.style'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'

// utils
import {
  getSatelliteParticipation,
  getStatusColorBasedOnOracleType,
} from 'providers/SatellitesProvider/helpers/satellites.utils'

// consts
import { SATELLITE_ORACLE_STATUSES } from 'providers/SatellitesProvider/satellites.const'
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'

// hooks
import { useSatelliteVotes } from 'providers/SatellitesProvider/hooks/useSatelliteVotes'
import { useSatelliteStatuses } from 'providers/SatellitesProvider/hooks/useSatelliteStatus'

// providers
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// types
import { SatelliteMapper } from 'providers/SatellitesProvider/satellites.provider.types'

type SatelliteDetailsScreenProps = {
  satelliteId: string
  usersSatelliteProfile: SatelliteMapper[0]
}
export const SatelliteDetailsScreen = ({ satelliteId, usersSatelliteProfile }: SatelliteDetailsScreenProps) => {
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const { proposalsAmount, satelliteGovActionsAmount, finRequestsAmount } = useSatellitesContext()

  const { proposalParticipation, votingParticipation: votingParticipation } = getSatelliteParticipation({
    satellite: usersSatelliteProfile,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
  })

  const { satelliteVotes, isLoading: isSatelliteVotesLoading } = useSatelliteVotes(satelliteId)
  const { oracleStatus } = useSatelliteStatuses(usersSatelliteProfile)
  const [showAggregatorPopup, setShowAggregatorPopup] = useState(false)

  const closePopup = useCallback(() => {
    setShowAggregatorPopup(false)
  }, [])

  const showPopup = useCallback(() => {
    setShowAggregatorPopup(true)
  }, [])

  // calcs
  const { sMvnBalance, delegationRatio, totalDelegatedAmount } = usersSatelliteProfile
  const freesMVNSpace = Math.max(sMvnBalance * delegationRatio - totalDelegatedAmount, 0)

  return (
    <SatelliteDetailsContainer>
      <div className="grid-container">
        <ThreeLevelListItem>
          <div className="name">Fee</div>
          <CommaNumber value={usersSatelliteProfile.satelliteFee} decimalsToShow={2} className="value" endingText="%" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Participation</div>
          <CommaNumber
            value={(proposalParticipation + votingParticipation) / 2}
            decimalsToShow={2}
            className="value"
            endingText="%"
          />
        </ThreeLevelListItem>

        <ThreeLevelListItem>
          <div className="name">Free sMVN Space</div>
          <CommaNumber value={freesMVNSpace} decimalsToShow={2} className="value" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Oracle Status</div>
          <div className="value">
            <SatelliteOracleStatusComponent>
              <StatusFlag
                status={getStatusColorBasedOnOracleType(oracleStatus)}
                text={SATELLITE_ORACLE_STATUSES[oracleStatus]}
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
              <CommaNumber value={proposalParticipation} endingText="%" showDecimal={false} />
            </p>
            <h5>Vote Participation</h5>
            <p>
              <CommaNumber value={votingParticipation} endingText="%" showDecimal={false} />
            </p>
            <h5>Oracle Participation</h5>
            <p>
              <CommaNumber value={usersSatelliteProfile.oracleEfficiency} endingText="%" showDecimal={false} />
            </p>
          </SatelliteMetricsBlock>
        </div>

        <SatelliteMetricsBlock>
          <h5>Satellite’s sMVN</h5>
          <p>
            <CommaNumber value={usersSatelliteProfile.sMvnBalance} showDecimal />
          </p>
          <h5># Delegators</h5>
          <p>
            <CommaNumber value={usersSatelliteProfile.delegatorCount} showDecimal={false} />
          </p>
          <h5># Oracle Feeds</h5>
          <p>
            <CommaNumber value={Object.keys(usersSatelliteProfile.participatedFeeds).length} showDecimal={false} />
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
          Register to an Aggregator
        </Button>
      </div>

      <AddToAggregatorPopup show={Boolean(usersSatelliteProfile) && showAggregatorPopup} closePopup={closePopup} />
    </SatelliteDetailsContainer>
  )
}

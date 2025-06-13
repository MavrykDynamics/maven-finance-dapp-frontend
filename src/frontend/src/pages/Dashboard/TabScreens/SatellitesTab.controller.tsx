import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// const
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_ACTIVE_SUB,
} from 'providers/SatellitesProvider/satellites.const'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BGPrimaryTitle } from 'pages/ContractStatuses/ContractStatuses.style'
import { StatBlock } from '../Dashboard.style'
import { EmptyContainer, SatellitesContentStyled, TabWrapperStyled } from './DashboardTabs.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// hooks
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

// helpers
// import { getSatelliteParticipation } from 'providers/SatellitesProvider/helpers/satellites.utils'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { SATELLITES_DASHBOARD_STATS } from 'providers/SatellitesProvider/queries/satellitesStats.query'

export const SatellitesTab = () => {
  const { handleApolloError } = useApolloContext()
  const {
    activeSatellitesIds,
    changeSatellitesSubscriptionsList,
    activeSatellitesCount,
    isLoading: isSatellitesLoading,
  } = useSatellitesContext()

  const [satelliteStats, setSatellitesStats] = useState({
    avgFee: 0,
  })

  const { loading } = useQueryWithRefetch(SATELLITES_DASHBOARD_STATS, {
    onCompleted: (data) => {
      const rawfee = data.activeSatellitesAmount.aggregate?.avg?.fee

      if (rawfee) {
        setSatellitesStats((prev) => ({ ...prev, avgFee: rawfee / 100 }))
      }
    },
    onError: (error) => handleApolloError(error, 'SATELLITES_DASHBOARD_STATS'),
  })

  useEffect(() => {
    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: SATELLITES_DATA_ACTIVE_SUB,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
    })

    return () => {
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
    }
  }, [])

  return (
    <TabWrapperStyled $backgroundImage="dashboard_satelliteTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Satellites</BGPrimaryTitle>
        <Link to="/satellites">
          <Button text="Satellites" icon="satellite" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>

      {isSatellitesLoading || loading ? (
        <DataLoaderWrapper className="tabLoader">
          <ClockLoader width={150} height={150} />
          <div className="text">Loading satellites</div>
        </DataLoaderWrapper>
      ) : activeSatellitesIds.length ? (
        <SatellitesContentStyled>
          <StatBlock>
            <div className="name">Active Satellites</div>
            <div className="value">
              <CommaNumber value={activeSatellitesCount} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. Delegated sMVN</div>
            <div className="value">
              {/* <CommaNumber endingText="sMVN" value={avgDelegatedMvn} /> */}
              Coming Soon
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. Free sMVN Space</div>
            <div className="value">
              {/* <CommaNumber endingText="sMVN" value={avgFreeMvnSpace} /> */}
              Coming Soon
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. Delegation Fee</div>
            <div className="value">
              <CommaNumber endingText="%" value={satelliteStats.avgFee} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. MVN Staked</div>
            <div className="value">
              {/* <CommaNumber endingText="sMVN" value={avgStakedMvn} /> */}
              Coming Soon
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Participation Rate</div>
            <div className="value">
              {/* <CommaNumber endingText="%" value={participationRate} /> */}
              Coming Soon
            </div>
          </StatBlock>
        </SatellitesContentStyled>
      ) : (
        <EmptyContainer>
          <img src="/images/not-found.svg" alt=" No active satellites data to show" />
          <figcaption> No active satellites data to show</figcaption>
        </EmptyContainer>
      )}

      <div className="descr">
        <div className="title">What are Satellites?</div>
        <div className="text">
          Satellites are nodes that administer the Maven Finance platform (similarly to validators on PoS). A Satellite
          can act on its own behalf and can receive delegations on behalf of others.
          <br />
          <br />
          To operate a Maven Finance Satellite, a users needs to stake a security deposit in MVN, and operate an oracle
          node for signing data feeds. For more information about starting & operating a Satellite.{' '}
          <a href="https://docs.mavenfinance.io/maven-finance/satellites-and-oracles" target="_blank" rel="noreferrer">
            Read More
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}

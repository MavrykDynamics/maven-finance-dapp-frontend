import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

// const
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_ACTIVE_SUB,
} from 'providers/SatellitesProvider/satellites.const'

// types
import { SatellitesContext } from 'providers/SatellitesProvider/satellites.provider.types'

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
import { getSatelliteParticipation } from 'providers/SatellitesProvider/helpers/satellites.utils'

export const SatellitesTab = () => {
  const {
    activeSatellitesIds,
    satelliteMapper,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
    changeSatellitesSubscriptionsList,
    isLoading: isSatellitesLoading,
  } = useSatellitesContext()

  useEffect(() => {
    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: SATELLITES_DATA_ACTIVE_SUB,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
    })

    return () => {
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
    }
  }, [])

  const { avgDelegatedMvn, avgFee, avgFreeMvnSpace, avgStakedMvn, participationRate } = useMemo(
    () =>
      reduceSatellitesData({
        activeSatellitesIds,
        satelliteMapper,
        proposalsAmount,
        satelliteGovActionsAmount,
        finRequestsAmount,
      }),
    [activeSatellitesIds, satelliteMapper, proposalsAmount, satelliteGovActionsAmount, finRequestsAmount],
  )

  return (
    <TabWrapperStyled $backgroundImage="dashboard_satelliteTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Satellites</BGPrimaryTitle>
        <Link to="/satellites">
          <Button text="Satellites" icon="satellite" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>

      {isSatellitesLoading ? (
        <DataLoaderWrapper className="tabLoader">
          <ClockLoader width={150} height={150} />
          <div className="text">Loading satellites</div>
        </DataLoaderWrapper>
      ) : activeSatellitesIds.length ? (
        <SatellitesContentStyled>
          <StatBlock>
            <div className="name">Active Satellites</div>
            <div className="value">
              <CommaNumber value={activeSatellitesIds.length} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. Delegated sMVN</div>
            <div className="value">
              <CommaNumber endingText="sMVN" value={avgDelegatedMvn} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. Free sMVN Space</div>
            <div className="value">
              <CommaNumber endingText="sMVN" value={avgFreeMvnSpace} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. Delegation Fee</div>
            <div className="value">
              <CommaNumber endingText="%" value={avgFee} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. MVN Staked</div>
            <div className="value">
              <CommaNumber endingText="sMVN" value={avgStakedMvn} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Participation Rate</div>
            <div className="value">
              <CommaNumber endingText="%" value={participationRate} />
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

const reduceSatellitesData = ({
  activeSatellitesIds,
  satelliteMapper,
  proposalsAmount,
  satelliteGovActionsAmount,
  finRequestsAmount,
}: {
  activeSatellitesIds: SatellitesContext['activeSatellitesIds']
  satelliteMapper: SatellitesContext['satelliteMapper']
  proposalsAmount: SatellitesContext['proposalsAmount']
  satelliteGovActionsAmount: SatellitesContext['satelliteGovActionsAmount']
  finRequestsAmount: SatellitesContext['finRequestsAmount']
}) => {
  const satellitesInfo = activeSatellitesIds.reduce(
    (acc, satelliteAddress) => {
      const satelliteRecord = satelliteMapper[satelliteAddress]
      if (!satelliteRecord || satelliteRecord.status !== 0) return acc

      const { proposalParticipation, votingParticipation } = getSatelliteParticipation({
        satellite: satelliteRecord,
        proposalsAmount,
        satelliteGovActionsAmount,
        finRequestsAmount,
      })

      acc.activeSatellites += 1
      acc.avgFee += satelliteRecord.satelliteFee
      acc.avgStakedMvn += satelliteRecord.sMvnBalance
      acc.participationRate += (proposalParticipation + votingParticipation) / 2
      acc.avgFreeMvnSpace += Math.max(
        satelliteRecord.sMvnBalance * satelliteRecord.delegationRatio - satelliteRecord.totalDelegatedAmount,
        0,
      )
      acc.avgDelegatedMvn += satelliteRecord.sMvnBalance + satelliteRecord.totalDelegatedAmount

      return acc
    },
    {
      activeSatellites: 0,
      avgFee: 0,
      avgDelegatedMvn: 0,
      avgStakedMvn: 0,
      participationRate: 0,
      avgFreeMvnSpace: 0,
    },
  )

  return {
    avgFee: satellitesInfo.avgFee / satellitesInfo.activeSatellites,
    avgStakedMvn: satellitesInfo.avgStakedMvn / satellitesInfo.activeSatellites,
    participationRate: satellitesInfo.participationRate / satellitesInfo.activeSatellites,
    avgFreeMvnSpace: satellitesInfo.avgFreeMvnSpace / satellitesInfo.activeSatellites,
    avgDelegatedMvn: satellitesInfo.avgDelegatedMvn / satellitesInfo.activeSatellites,
  }
}

import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

// const
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import {
  SATELLITE_DATA_SUB,
  SATELLITES_DATA_ACTIVE_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
  DEFAULT_SATELLITES_ACTIVE_SUBS,
} from 'providers/SatellitesProvider/satellites.const'

// types
import { SatellitesContext } from 'providers/SatellitesProvider/satellites.provider.types'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { StatBlock } from '../Dashboard.style'
import { EmptyContainer, SatellitesContentStyled, TabWrapperStyled } from './DashboardTabs.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// hooks
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

// helpers
import { getSatelliteParticipations } from 'providers/SatellitesProvider/helpers/satellites.utils'

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

  const { avgDelegatedsMVK, avgFee, avgFreesMVKSpace, avgStakedMVK, partisipationRate } = useMemo(
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
    <TabWrapperStyled backgroundImage="dashboard_satelliteTab_bg.png">
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
            <div className="name">Avg. Delegated sMVK</div>
            <div className="value">
              <CommaNumber endingText="sMVK" value={avgDelegatedsMVK} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. Free sMVK Space</div>
            <div className="value">
              <CommaNumber endingText="sMVK" value={avgFreesMVKSpace} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. Delegation Fee</div>
            <div className="value">
              <CommaNumber endingText="%" value={avgFee} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. MVK Staked</div>
            <div className="value">
              <CommaNumber endingText="sMVK" value={avgStakedMVK} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Participation Rate</div>
            <div className="value">
              <CommaNumber endingText="%" value={partisipationRate} />
            </div>
          </StatBlock>
        </SatellitesContentStyled>
      ) : (
        <EmptyContainer>
          <img src="/images/not-found.svg" alt=" No active satellites to show" />
          <figcaption> No active satellites to show</figcaption>
        </EmptyContainer>
      )}

      <div className="descr">
        <div className="title">What are Satellites?</div>
        <div className="text">
          Satellites are nodes that administer the Mavryk platform (similarly to validators on PoS). A Satellite can act
          on its own behalf and can receive delegations on behalf of others.
          <br />
          <br />
          To operate a Mavryk Satellite, a users needs to stake a security deposit in MVK, and operate an oracle node
          for signing data feeds. For more information about starting & operating a Satellite.{' '}
          <a href="https://blogs.mavryk.finance/" target="_blank" rel="noreferrer">
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

      const { proposalParticipation, votingPartisipation } = getSatelliteParticipations({
        satellite: satelliteRecord,
        proposalsAmount,
        satelliteGovActionsAmount,
        finRequestsAmount,
      })

      acc.activeSatellites += 1
      acc.avgFee += satelliteRecord.satelliteFee
      acc.avgStakedMVK += satelliteRecord.sMvkBalance
      acc.partisipationRate += (proposalParticipation + votingPartisipation) / 2
      acc.avgFreesMVKSpace += Math.max(
        satelliteRecord.sMvkBalance * satelliteRecord.delegationRatio - satelliteRecord.totalDelegatedAmount,
        0,
      )
      acc.avgDelegatedsMVK += satelliteRecord.sMvkBalance + satelliteRecord.totalDelegatedAmount

      return acc
    },
    {
      activeSatellites: 0,
      avgFee: 0,
      avgDelegatedsMVK: 0,
      avgStakedMVK: 0,
      partisipationRate: 0,
      avgFreesMVKSpace: 0,
    },
  )

  return {
    avgFee: satellitesInfo.avgFee / satellitesInfo.activeSatellites,
    avgStakedMVK: satellitesInfo.avgStakedMVK / satellitesInfo.activeSatellites,
    partisipationRate: satellitesInfo.partisipationRate / satellitesInfo.activeSatellites,
    avgFreesMVKSpace: satellitesInfo.avgFreesMVKSpace / satellitesInfo.activeSatellites,
    avgDelegatedsMVK: satellitesInfo.avgDelegatedsMVK / satellitesInfo.activeSatellites,
  }
}

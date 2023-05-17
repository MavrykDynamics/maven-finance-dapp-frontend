import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { State } from 'reducers'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

import { emptyContainer } from './LendingTab.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { StatBlock } from '../Dashboard.style'
import { SatellitesContentStyled, TabWrapperStyled } from './DashboardTabs.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

export const SatellitesTab = ({ isLoading }: { isLoading: boolean }) => {
  const { activeSatellitesIds, satelliteMapper } = useSelector((state: State) => state.satellites)

  const satellitesInfo = activeSatellitesIds.reduce(
    (acc, satelliteAddress) => {
      const satelliteRecord = satelliteMapper[satelliteAddress]
      if (!satelliteRecord || satelliteRecord.status !== 0) return acc

      acc.activeSatellites += 1
      acc.avgFee += satelliteRecord.satelliteFee
      acc.avgStakedMVK += satelliteRecord.sMvkBalance
      acc.partisipationRate +=
        (satelliteRecord.satelliteMetrics.proposalParticipation +
          satelliteRecord.satelliteMetrics.votingPartisipation) /
        2
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

  satellitesInfo.avgFee = satellitesInfo.avgFee / satellitesInfo.activeSatellites
  satellitesInfo.avgStakedMVK = satellitesInfo.avgStakedMVK / satellitesInfo.activeSatellites
  satellitesInfo.partisipationRate = satellitesInfo.partisipationRate / satellitesInfo.activeSatellites
  satellitesInfo.avgFreesMVKSpace = satellitesInfo.avgFreesMVKSpace / satellitesInfo.activeSatellites
  satellitesInfo.avgDelegatedsMVK = satellitesInfo.avgDelegatedsMVK / satellitesInfo.activeSatellites

  return (
    <TabWrapperStyled backgroundImage="dashboard_satelliteTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Satellites</BGPrimaryTitle>
        <Link to="/satellites">
          <Button text="Satellites" icon="satellite" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>

      {isLoading ? (
        <DataLoaderWrapper className="tabLoader">
          <ClockLoader width={150} height={150} />
          <div className="text">Loading satellites</div>
        </DataLoaderWrapper>
      ) : activeSatellitesIds.length ? (
        <SatellitesContentStyled>
          <StatBlock>
            <div className="name">Active Satellites</div>
            <div className="value">
              <CommaNumber value={satellitesInfo.activeSatellites} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. Delegated sMVK</div>
            <div className="value">
              <CommaNumber endingText="sMVK" value={satellitesInfo.avgDelegatedsMVK} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. Free sMVK Space</div>
            <div className="value">
              <CommaNumber endingText="sMVK" value={satellitesInfo.avgFreesMVKSpace} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. Delegation Fee</div>
            <div className="value">
              <CommaNumber endingText="%" value={satellitesInfo.avgFee} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Avg. MVK Staked</div>
            <div className="value">
              <CommaNumber endingText="sMVK" value={satellitesInfo.avgStakedMVK} />
            </div>
          </StatBlock>

          <StatBlock>
            <div className="name">Participation Rate</div>
            <div className="value">
              <CommaNumber endingText="%" value={satellitesInfo.partisipationRate} />
            </div>
          </StatBlock>
        </SatellitesContentStyled>
      ) : (
        emptyContainer
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

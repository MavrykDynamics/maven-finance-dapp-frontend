import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

import { Button } from 'app/App.components/Button/Button.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { DelegationStatusBlock } from './DashboardPersonalComponents.style'

import { getSatelliteMetrics } from 'pages/Satellites/Satellites.normalizer'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

const DelegationTab = () => {
  const { satelliteMvkIsDelegatedTo } = useSelector((state: State) => state.wallet.user)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)
  const { financialRequests } = useSelector((state: State) => state.financialRequest)
  const satelliteInfo = satelliteLedger.find(({ address }) => satelliteMvkIsDelegatedTo === address)

  const {
    governanceStorage: { proposalLedger },
    pastProposals,
  } = useSelector((state: State) => state.governance)
  const { eGovProposals } = useSelector((state: State) => state.emergencyGovernance)
  const { feedsLedger } = useSelector((state: State) => state.dataFeeds)

  const satelliteMetrics = satelliteInfo
    ? getSatelliteMetrics(pastProposals, proposalLedger, eGovProposals, satelliteInfo, feedsLedger, financialRequests)
    : null

  return (
    <>
      <DelegationStatusBlock>
        <GovRightContainerTitleArea>
          <h2>Delegation Status</h2>
        </GovRightContainerTitleArea>
        {satelliteMvkIsDelegatedTo && satelliteInfo && satelliteMetrics ? (
          <>
            <div className="delegated-to">Delegated To</div>
            <div className="top-row">
              <div className="grid-item info">
                <ImageWithPlug imageLink={satelliteInfo.image} alt={satelliteInfo.name + ' avatar'} />
                <div className="text">
                  <div className="name">{satelliteInfo.name}</div>
                  <div className="value">
                    <TzAddress tzAddress={satelliteInfo.address} />
                  </div>
                </div>
              </div>
              <div className="grid-item space">
                <div className="name">Free MVK Space</div>
                <div className="value">
                  <CommaNumber
                    value={Math.max(
                      satelliteInfo.sMvkBalance * satelliteInfo.delegationRatio - satelliteInfo.totalDelegatedAmount,
                      0,
                    )}
                  />
                </div>
              </div>
              <div className="grid-item participation">
                <div className="name">Gov. Participation</div>
                <div className="value">
                  <CommaNumber value={satelliteMetrics.proposalParticipation} endingText="%" />
                </div>
              </div>
              <div className="grid-item delegated">
                <div className="name">Delegated MVK</div>
                <div className="value">
                  <CommaNumber value={satelliteInfo.totalDelegatedAmount + satelliteInfo.sMvkBalance} />
                </div>
              </div>
              <div className="grid-item fee">
                <div className="name">Fee</div>
                <div className="value">
                  <CommaNumber value={satelliteInfo.satelliteFee} endingText="%" />
                </div>
              </div>
              <div className="grid-item oraclePart">
                <div className="name">Oracle Participation</div>
                <div className="value">
                  <CommaNumber value={satelliteMetrics.oracleEfficiency} endingText="%" />
                </div>
              </div>
            </div>
            <Link to="/satellites">Satellites Overview</Link>
          </>
        ) : (
          <div className="no-data">
            <span>You are not delegated at this time.</span>
            <Link to="/satellites">
              <Button
                text="Satellites"
                icon="satellite"
                kind={ACTION_PRIMARY}
                className="noStroke dashboard-sectionLink"
              />
            </Link>
          </div>
        )}
      </DelegationStatusBlock>
    </>
  )
}

export default DelegationTab

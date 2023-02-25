import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { ACTION_SECONDARY } from 'app/App.components/Button/Button.constants'

import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { DelegationStatusBlock } from './DashboardPersonalComponents.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import NewButton from 'app/App.components/Button/NewButton.controller'
import Icon from 'app/App.components/Icon/Icon.view'

const DelegationTab = () => {
  const { satelliteMvkIsDelegatedTo, mySMvkTokenBalance } = useSelector((state: State) => state.wallet.user)
  const { satelliteMapper } = useSelector((state: State) => state.satellites)
  const satelliteInfo = satelliteMapper[satelliteMvkIsDelegatedTo]

  return (
    <>
      <DelegationStatusBlock>
        <GovRightContainerTitleArea>
          <h2>Delegation Status</h2>
        </GovRightContainerTitleArea>
        {satelliteMvkIsDelegatedTo && satelliteInfo ? (
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
                  <CommaNumber value={satelliteInfo.satelliteMetrics.proposalParticipation} endingText="%" />
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
                  <CommaNumber value={satelliteInfo.satelliteMetrics.oracleEfficiency} endingText="%" />
                </div>
              </div>
            </div>
            <Link to="/satellites">Satellites Overview</Link>
          </>
        ) : mySMvkTokenBalance === 0 ? (
          <div className="no-data">
            <span>You don't have SMVK</span>
            <Link to="/">
              <NewButton kind={ACTION_SECONDARY} className="dashboard-sectionLink">
                <Icon id="menu-staking" /> Stake MVK
              </NewButton>
            </Link>
          </div>
        ) : (
          <div className="no-data">
            <span>You are not delegated at this time</span>
            <Link to="/satellites">
              <NewButton kind={ACTION_SECONDARY} className="dashboard-sectionLink">
                <Icon id="satellite" /> View Satellites
              </NewButton>
            </Link>
          </div>
        )}
      </DelegationStatusBlock>
    </>
  )
}

export default DelegationTab

import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { State } from 'reducers'

import { BUTTON_SECONDARY, BUTTON_WIDE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { distributeProposalRewards } from 'pages/Satellites/Satellites.actions'

import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DelegationStatusBlock } from './DashboardPersonalComponents.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { UserActionHistory } from './UserOperationsHistory'
import { DashboardCardHeader } from '../DashboardPersonal.style'
import { ConnectWallet } from 'app/App.components/ConnectWallet/ConnectWallet.controller'
import { useStakeUpdater } from 'providers/StakeProvider/hooks/useStakeUpdater'

const DelegationTab = () => {
  const dispatch = useDispatch()
  const {
    user: {
      satelliteMvkIsDelegatedTo,
      mySMvkTokenBalance,
      mySatelliteRewardsData: { myAvailableSatelliteRewards },
    },
    accountPkh,
  } = useSelector((state: State) => state.wallet)
  const { satelliteMapper } = useSelector((state: State) => state.satellites)
  const satelliteInfo = satelliteMapper[satelliteMvkIsDelegatedTo]

  useStakeUpdater(true)

  const handleDistributeRewards = () => {
    // TODO: add valid data
    dispatch(distributeProposalRewards('', []))
  }

  return (
    <>
      <DelegationStatusBlock>
        <DashboardCardHeader>
          <h2>Delegation Status</h2>

          <NewButton
            kind={BUTTON_PRIMARY}
            form={BUTTON_WIDE}
            onClick={handleDistributeRewards}
            disabled={myAvailableSatelliteRewards === 0}
          >
            <Icon id="loans" />
            Distribute Gov. Rewards
          </NewButton>
        </DashboardCardHeader>
        {satelliteInfo ? (
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
        ) : mySMvkTokenBalance === 0 && accountPkh ? (
          <div className="no-data">
            <span>You don't have SMVK</span>
            <div className="nav-button">
              <Link to="/">
                <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE}>
                  <Icon id="menu-staking" /> Stake MVK
                </NewButton>
              </Link>
            </div>
          </div>
        ) : accountPkh && mySMvkTokenBalance ? (
          <div className="no-data">
            <span>You are not delegated at this time</span>
            <div className="nav-button">
              <Link to="/satellites">
                <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE}>
                  <Icon id="satellite" /> View Satellites
                </NewButton>
              </Link>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <div className="nav-button">
              <ConnectWallet />
            </div>
          </div>
        )}
      </DelegationStatusBlock>

      <UserActionHistory />
    </>
  )
}

export default DelegationTab

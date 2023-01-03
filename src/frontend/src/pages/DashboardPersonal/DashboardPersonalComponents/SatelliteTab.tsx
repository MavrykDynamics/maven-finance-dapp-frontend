import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { borrowingData, historyData, lendingData } from '../tabs.const'
import { getOracleStatus, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { DEFAULT_SATELLITE } from 'reducers/delegation'
import { getSatelliteMetrics } from 'pages/Satellites/Satellites.helpers'

import { Button } from 'app/App.components/Button/Button.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import {
  DashboardPersonalTabStyled,
  LBHInfoBlock,
  SatelliteStatusBlock,
  ListItem,
  HistoryBlock,
} from './DashboardPersonalComponents.style'
import { SatelliteOracleStatusComponent } from 'pages/Satellites/SatelliteList/ListCards/SatelliteCard.style'

import { State } from 'reducers'

type SatelliteTabProps = {}

const SatelliteTab = ({}: SatelliteTabProps) => {
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const {
    governanceStorage: { financialRequestLedger, proposalLedger },
    pastProposals,
  } = useSelector((state: State) => state.governance)
  const {
    emergencyGovernanceStorage: { emergencyGovernanceLedger },
  } = useSelector((state: State) => state.emergencyGovernance)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const satelliteRecord = satelliteLedger.find(({ address }) => address === accountPkh) ?? DEFAULT_SATELLITE

  const satelliteMetrics = useMemo(
    () =>
      getSatelliteMetrics(
        pastProposals,
        proposalLedger,
        emergencyGovernanceLedger,
        satelliteRecord,
        feeds,
        financialRequestLedger,
      ),
    [emergencyGovernanceLedger, feeds, financialRequestLedger, pastProposals, proposalLedger, satelliteRecord],
  )

  const oracleStatusType = getOracleStatus(satelliteRecord, feeds)

  return (
    <DashboardPersonalTabStyled>
      <SatelliteStatusBlock>
        <GovRightContainerTitleArea>
          <h2>My Satellite Details</h2>
        </GovRightContainerTitleArea>
        <div className="top-row">
          <div className="grid-item info">
            {satelliteRecord.image ? (
              <div className="satellite-avatar">
                <img src={satelliteRecord.image} alt={satelliteRecord.name + ' avatar'} />
              </div>
            ) : (
              <Icon id="noImage" />
            )}

            <div className="text">
              <div className="name">{satelliteRecord.name}</div>
              <div className="value">
                <TzAddress tzAddress={satelliteRecord.address} />
              </div>
            </div>
          </div>
          <div className="grid-item ">
            <div className="name">Free MVK Space</div>
            <div className="value">
              <CommaNumber
                value={Math.max(
                  satelliteRecord.sMvkBalance * satelliteRecord.delegationRatio - satelliteRecord.totalDelegatedAmount,
                  0,
                )}
              />
            </div>
          </div>
          <div className="grid-item ">
            <div className="name">Gov. Participation</div>
            <div className="value">
              <CommaNumber value={satelliteMetrics.votingPartisipation} endingText="%" />
            </div>
          </div>
          <div className="grid-item ">
            <div className="name">Delegated MVK</div>
            <div className="value">
              <CommaNumber value={satelliteRecord.totalDelegatedAmount} />
            </div>
          </div>
          <div className="grid-item ">
            <div className="name">Oracle Participation</div>
            <div className="value">
              <CommaNumber value={satelliteMetrics.oracleEfficiency} endingText="%" />
            </div>
          </div>
        </div>
        <div className="bottom-row">
          <div className="grid-item ">
            <div className="name">Fee</div>
            <div className="value">
              <CommaNumber value={satelliteRecord.satelliteFee} endingText="%" />
            </div>
          </div>
          <div className="grid-item ">
            <div className="name">Oracle Status</div>
            <div className="value">
              <SatelliteOracleStatusComponent statusType={oracleStatusType}>
                {ORACLE_STATUSES_MAPPER[oracleStatusType]}
              </SatelliteOracleStatusComponent>
            </div>
          </div>
          <div className="grid-item ">
            <div className="name">Website</div>
            <div className="value">
              <a href={satelliteRecord.website}>{satelliteRecord.website}</a>
            </div>
          </div>
        </div>
        <Link to="/become-satellite">Edit My Profile</Link>
      </SatelliteStatusBlock>

      <HistoryBlock>
        <GovRightContainerTitleArea>
          <h2>History</h2>
        </GovRightContainerTitleArea>
        {historyData ? (
          <div className="list scroll-block">
            {historyData.map(({ action, amount, exitFee, totalAmount, user, id }) => {
              return (
                <ListItem columsTemplate={`25% 25% ${user ? '50%' : ' 25% 25%'}  `} key={id + action}>
                  <div className="list-part">
                    <div className="name">Action</div>
                    <div className="value">{action}</div>
                  </div>
                  <div className="list-part">
                    <div className="name">Amount</div>
                    <div className="value">
                      <CommaNumber value={amount} endingText="MVK" />
                    </div>
                  </div>
                  {exitFee ? (
                    <div className="list-part">
                      <div className="name">Exit Fee</div>
                      <div className="value">
                        <CommaNumber value={exitFee} endingText="%" />
                      </div>
                    </div>
                  ) : (
                    !user && <div className="list-part" />
                  )}
                  {totalAmount ? (
                    <div className="list-part">
                      <div className="name">Total Amount</div>
                      <div className="value">
                        <CommaNumber value={totalAmount} endingText="MVK" />
                      </div>
                    </div>
                  ) : (
                    !user && <div className="list-part" />
                  )}
                  {user ? (
                    <div className="list-part user">
                      <Icon id={user.avatar || 'noImage'} />
                      <div className="user-info">
                        <div className="name">{user.name}</div>
                        <TzAddress tzAddress={user.address} className="value user-address" hasIcon={true} />
                      </div>
                    </div>
                  ) : null}
                </ListItem>
              )
            })}
          </div>
        ) : (
          <div className="no-data">
            <span>You do not have any previous delegation history</span>
          </div>
        )}
      </HistoryBlock>
    </DashboardPersonalTabStyled>
  )
}

export default SatelliteTab

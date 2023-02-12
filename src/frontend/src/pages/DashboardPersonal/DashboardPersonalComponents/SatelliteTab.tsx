import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { getOracleStatus, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { DEFAULT_SATELLITE } from 'reducers/delegation'
import { getSatelliteMetrics } from 'pages/Satellites/Satellites.helpers'

import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { SatelliteStatusBlock } from './DashboardPersonalComponents.style'
import { SatelliteOracleStatusComponent } from 'pages/Satellites/SatelliteList/ListCards/SatelliteCard.style'

import { State } from 'reducers'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

const SatelliteTab = () => {
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const {
    governanceStorage: { financialRequestLedger, proposalLedger },
    pastProposals,
  } = useSelector((state: State) => state.governance)
  const { eGovProposals } = useSelector((state: State) => state.emergencyGovernance)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const satelliteRecord = satelliteLedger.find(({ address }) => address === accountPkh) ?? DEFAULT_SATELLITE

  const satelliteMetrics = useMemo(
    () =>
      getSatelliteMetrics(pastProposals, proposalLedger, eGovProposals, satelliteRecord, feeds, financialRequestLedger),
    [eGovProposals, feeds, financialRequestLedger, pastProposals, proposalLedger, satelliteRecord],
  )

  const oracleStatusType = getOracleStatus(satelliteRecord, feeds)

  return (
    <>
      <SatelliteStatusBlock>
        <GovRightContainerTitleArea>
          <h2>My Satellite Details</h2>
        </GovRightContainerTitleArea>
        <div className="top-row">
          <div className="grid-item info">
            <ImageWithPlug imageLink={satelliteRecord.image} alt={satelliteRecord.name + ' avatar'} />

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
    </>
  )
}

export default SatelliteTab

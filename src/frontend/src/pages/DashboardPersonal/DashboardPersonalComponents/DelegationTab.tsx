import { useEffect } from 'react'
import { Link, useOutletContext } from 'react-router'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'
import { TOTAL_VOTING_POWER_TOOLTIP_TEXT } from 'texts/tooltips/satellite'

// view
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DashboardPersonalSatellitesBottomLinks, DelegationStatusBlock } from './DashboardPersonalComponents.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { UserActionHistory } from './UserOperationsHistory'
import { DashboardCardHeader } from '../DashboardPersonal.style'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import ConnectWalletBtn from 'app/App.components/ConnectWallet/ConnectWalletBtn'

// providers
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

// helpers
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getSatelliteParticipation } from 'providers/SatellitesProvider/helpers/satellites.utils'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_SINGLE_SUB,
} from 'providers/SatellitesProvider/satellites.const'

type DelegationtabOutletProps = {
  distributeProposalRewards: () => void
  availableProposalRewards: Array<number>
}

const DelegationTab = () => {
  const { distributeProposalRewards, availableProposalRewards }: DelegationtabOutletProps = useOutletContext()

  const {
    satelliteMapperByAddress,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
    changeSatellitesSubscriptionsList,
    setSatelliteAddressToSubscribe,
    isLoading: isSatellitesLoading,
  } = useSatellitesContext()
  const { userTokensBalances, satelliteMvnIsDelegatedTo, userAddress } = useUserContext()

  const userSmvnBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVN_TOKEN_ADDRESS })

  useEffect(() => {
    changeSatellitesSubscriptionsList({
      [SATELLITES_DATA_SINGLE_SUB]: true,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
    })

    return () => {
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
    }
  }, [])

  useEffect(() => {
    if (satelliteMvnIsDelegatedTo) {
      setSatelliteAddressToSubscribe(satelliteMvnIsDelegatedTo)
    }
    return () => setSatelliteAddressToSubscribe(null)
  }, [satelliteMvnIsDelegatedTo])

  const satelliteRecord = satelliteMvnIsDelegatedTo ? satelliteMapperByAddress[satelliteMvnIsDelegatedTo] : null
  const { proposalParticipation } = getSatelliteParticipation({
    satellite: satelliteRecord,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
  })

  return (
    <>
      <DelegationStatusBlock>
        <DashboardCardHeader>
          <h2>Delegation Status</h2>

          <NewButton
            kind={BUTTON_PRIMARY}
            form={BUTTON_WIDE}
            onClick={distributeProposalRewards}
            disabled={availableProposalRewards.length === 0}
          >
            <Icon id="loans" />
            Distribute Gov. Rewards
          </NewButton>
        </DashboardCardHeader>
        {satelliteMvnIsDelegatedTo && isSatellitesLoading ? (
          <DataLoaderWrapper margin="20px 0 0 0">
            <ClockLoader width={75} height={75} />
            <div className="text">Loading your delegation data</div>
          </DataLoaderWrapper>
        ) : satelliteRecord ? (
          <>
            <div className="delegated-to">Delegated To</div>
            <div className="top-row">
              <div className="grid-item info">
                <ImageWithPlug imageLink={satelliteRecord.image} alt={satelliteRecord.name + ' avatar'} useRounded />
                <div className="text">
                  <div className="name">{satelliteRecord.name}</div>
                  <div className="value">
                    <TzAddress tzAddress={satelliteRecord.address} />
                  </div>
                </div>
              </div>
              <div className="grid-item space">
                <div className="text-wrapper">
                  <div className="name">Total Voting Power</div>
                  <Tooltip>
                    <Tooltip.Trigger className="ml-3">
                      <Icon id="info" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>{TOTAL_VOTING_POWER_TOOLTIP_TEXT}</Tooltip.Content>
                  </Tooltip>
                </div>
                <div className="value">
                  <CommaNumber value={satelliteRecord.totalVotingPower} endingText="sMVN" />
                </div>
              </div>
              <div className="grid-item space">
                <div className="name">Free MVN Space</div>
                <div className="value">
                  <CommaNumber
                    value={Math.max(
                      satelliteRecord.sMvnBalance * satelliteRecord.delegationRatio -
                        satelliteRecord.totalDelegatedAmount,
                      0,
                    )}
                  />
                </div>
              </div>
              <div className="grid-item participation">
                <div className="name">Gov. Participation</div>
                <div className="value">
                  <CommaNumber value={proposalParticipation} endingText="%" />
                </div>
              </div>
              <div className="grid-item delegated">
                <div className="name">Delegated MVN</div>
                <div className="value">
                  <CommaNumber value={satelliteRecord.totalDelegatedAmount + satelliteRecord.sMvnBalance} />
                </div>
              </div>
              <div className="grid-item fee">
                <div className="name">Fee</div>
                <div className="value">
                  <CommaNumber value={satelliteRecord.satelliteFee} endingText="%" />
                </div>
              </div>
              <div className="grid-item oraclePart">
                <div className="name">Oracle Participation</div>
                <div className="value">
                  <CommaNumber value={satelliteRecord.oracleEfficiency} endingText="%" />
                </div>
              </div>
            </div>
            <DashboardPersonalSatellitesBottomLinks>
              <Link to="/satellites">Satellites Overview</Link>
              <Link to={`/satellites/satellite-details/${satelliteRecord.address}`}>My Satellite</Link>
            </DashboardPersonalSatellitesBottomLinks>
          </>
        ) : userSmvnBalance === 0 && userAddress ? (
          <div className="no-data">
            <span>You don't have sMVN</span>
            <div className="nav-button">
              <Link to="/staking">
                <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                  <Icon id="menu-staking" /> Stake MVN
                </NewButton>
              </Link>
            </div>
          </div>
        ) : userAddress && userSmvnBalance ? (
          <div className="no-data">
            <span>You are not delegated at this time</span>
            <div className="nav-button">
              <Link to="/satellites">
                <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                  <Icon id="satellite" /> Satellites
                </NewButton>
              </Link>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <div className="nav-button">
              <ConnectWalletBtn />
            </div>
          </div>
        )}
      </DelegationStatusBlock>

      <UserActionHistory />
    </>
  )
}

export default DelegationTab

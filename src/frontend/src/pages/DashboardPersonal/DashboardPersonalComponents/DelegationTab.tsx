import { useEffect } from 'react'
import { Link } from 'react-router-dom'

// consts
import { BUTTON_SECONDARY, BUTTON_WIDE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import colors from 'styles/colors'
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
import ConnectWalletBtn from 'app/App.components/ConnectWallet/ConnectWalletBtn'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// providers
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserRewards } from 'providers/UserProvider/hooks/useUserRewards'

// helpers
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { getSatelliteParticipations } from 'providers/SatellitesProvider/helpers/satellites.utils'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

const DelegationTab = ({ distributeProposalRewards }: { distributeProposalRewards: () => void }) => {
  const {
    satelliteMapper,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
    setSatelliteAddressToSubsctibe,
    isLoading: isSatellitesLoading,
  } = useSatellitesContext()
  const { userTokensBalances, satelliteMvkIsDelegatedTo, userAddress } = useUserContext()
  const { availableProposalRewards } = useUserRewards()
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const userSmvkBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS })

  useEffect(() => {
    if (satelliteMvkIsDelegatedTo) {
      setSatelliteAddressToSubsctibe(satelliteMvkIsDelegatedTo)
    }
    return () => setSatelliteAddressToSubsctibe(null)
  }, [satelliteMvkIsDelegatedTo])

  const satelliteRecord = satelliteMvkIsDelegatedTo ? satelliteMapper[satelliteMvkIsDelegatedTo] : null
  const { proposalParticipation } = getSatelliteParticipations({
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
        {satelliteMvkIsDelegatedTo && isSatellitesLoading ? (
          <DataLoaderWrapper margin="20px 0 0 0">
            <ClockLoader width={75} height={75} />
            <div className="text">Loading your delegation data</div>
          </DataLoaderWrapper>
        ) : satelliteRecord ? (
          <>
            <div className="delegated-to">Delegated To</div>
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
              <div className="grid-item space">
                <div className="text-wrapper">
                  <div className="name">Total Voting Power</div>
                  <CustomTooltip
                    text={TOTAL_VOTING_POWER_TOOLTIP_TEXT}
                    iconId="info"
                    defaultStrokeColor={colors[themeSelected]['textColor']}
                  />
                </div>
                <div className="value">
                  <CommaNumber value={satelliteRecord.totalVotingPower} endingText="sMVK" />
                </div>
              </div>
              <div className="grid-item space">
                <div className="name">Free MVK Space</div>
                <div className="value">
                  <CommaNumber
                    value={Math.max(
                      satelliteRecord.sMvkBalance * satelliteRecord.delegationRatio -
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
                <div className="name">Delegated MVK</div>
                <div className="value">
                  <CommaNumber value={satelliteRecord.totalDelegatedAmount + satelliteRecord.sMvkBalance} />
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
              <Link to={`/satellites/satellite-details/${satelliteRecord.address}`}>View Satellite Profile</Link>
            </DashboardPersonalSatellitesBottomLinks>
          </>
        ) : userSmvkBalance === 0 && userAddress ? (
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
        ) : userAddress && userSmvkBalance ? (
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

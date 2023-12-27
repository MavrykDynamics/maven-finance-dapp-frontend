import { Link } from 'react-router-dom'

// hooks
import { useSatelliteStatistics } from 'providers/SatellitesProvider/hooks/useSatelliteStatistics'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { SATELLITE_TAB_EDIT } from 'pages/BecomeSatellite/BecomeSatellite.conts'

// view
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import Button from 'app/App.components/Button/NewButton'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import Icon from 'app/App.components/Icon/Icon.view'
import {
  FAQLink,
  SatelliteSideBarStyled,
  SideBarFaq,
  SideBarItem,
  SideBarSection,
  SidebarUserButton,
} from './SatelliteSideBar.style'

export const SateliteSideBarFAQ = () => (
  <SideBarFaq>
    <h2>Satellite FAQ</h2>
    <FAQLink>
      <a href="https://docs.mavryk.finance/mavryk-finance/governance" target="_blank" rel="noreferrer">
        Who controls Maven Finance, and how are decisions made?
      </a>
    </FAQLink>
    <FAQLink>
      <a href="https://docs.mavryk.finance/mavryk-finance/satellites-and-oracles" target="_blank" rel="noreferrer">
        What are Satellite’s and what do they do?
      </a>
    </FAQLink>
    <FAQLink>
      <a
        href="https://docs.mavryk.finance/mavryk-finance/satellites-and-oracles/oracle-nodes"
        target="_blank"
        rel="noreferrer"
      >
        How is the price data secured with the decentralized oracle?
      </a>
    </FAQLink>
    <FAQLink>
      <a
        href="https://docs.mavryk.finance/mavryk-finance/staking/benefits-and-fees-of-staking"
        target="_blank"
        rel="noreferrer"
      >
        What is the difference between MVN and Staked MVN (sMVK)?
      </a>
    </FAQLink>
    <FAQLink>
      <a
        href="https://docs.mavryk.finance/mavryk-finance/satellites-and-oracles/delegating-to-satellites"
        target="_blank"
        rel="noreferrer"
      >
        How can I be involved with the DAO without setting up my own Satellite?
      </a>
    </FAQLink>
  </SideBarFaq>
)

const SidebarUserEditButton = ({ image, name }: { image: string; name: string }) => {
  return (
    <SidebarUserButton title={name}>
      <ImageWithPlug imageLink={image} alt="your satellite profile avatar" />
      <div>
        <div className="name">{name}</div>
        <div className="link">View Satellite Profile</div>
      </div>
    </SidebarUserButton>
  )
}

const SatellitesSideBar = ({ isButton = true }: { isButton?: boolean }) => {
  const {
    userAddress,
    isSatellite,
    userSatelliteName,
    userAvatars: { satelliteAvatar },
  } = useUserContext()
  const {
    contractAddresses: { delegationAddress, feedsFactoryAddress },
  } = useDappConfigContext()

  const { totalDelegatedMVN, totalActiveSatellites, totalOracleNetworks, averageOracleReward } =
    useSatelliteStatistics()
  const { feedsAddresses } = useDataFeedsContext()

  return (
    <SatelliteSideBarStyled>
      <SideBarSection>
        {isButton ? (
          <Link to={`/become-satellite/${SATELLITE_TAB_EDIT}}`}>
            {isSatellite && satelliteAvatar && userSatelliteName ? (
              <SidebarUserEditButton name={userSatelliteName} image={satelliteAvatar} />
            ) : (
              <Button kind={BUTTON_PRIMARY} disabled={!userAddress} form={BUTTON_WIDE}>
                <Icon id="satellite-stroke" />
                Become a Satellite
              </Button>
            )}
          </Link>
        ) : null}

        <h2>Info</h2>
        <SideBarItem>
          <h3>Satellite Contract</h3>
          <var>{<TzAddress tzAddress={delegationAddress} hasIcon />}</var>
        </SideBarItem>
        <SideBarItem>
          <h3>Oracles Contract</h3>
          <var>
            <TzAddress tzAddress={feedsFactoryAddress} hasIcon />
          </var>
        </SideBarItem>
      </SideBarSection>

      <SideBarSection>
        <h2>Statistics</h2>
        <SideBarItem>
          <h3>Number of Satellites</h3>
          <var>
            <CommaNumber value={totalActiveSatellites} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>On-Chain Data Points</h3>
          <var>
            <CommaNumber value={feedsAddresses.length} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Total Oracles</h3>
          <var>
            <CommaNumber value={totalOracleNetworks} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Total delegated MVK</h3>
          <var>
            <CommaNumber value={totalDelegatedMVN} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Avg. Oracles Rewards MVK</h3>
          <var>
            <CommaNumber value={averageOracleReward} />
          </var>
        </SideBarItem>
      </SideBarSection>

      <SateliteSideBarFAQ />
    </SatelliteSideBarStyled>
  )
}

export default SatellitesSideBar

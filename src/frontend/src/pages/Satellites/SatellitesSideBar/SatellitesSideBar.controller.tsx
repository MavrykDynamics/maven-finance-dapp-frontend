import { Link } from 'react-router-dom'

import { useFeedsStats } from 'providers/DataFeedsProvider/hooks/useFeedsStats'
import { useSatelliteStatistics } from 'providers/SatellitesProvider/hooks/useSatelliteStatistics'

import { convertNumberForClient } from 'utils/calcFunctions'

import { ACTION_PRIMARY, BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { MVK_DECIMALS } from 'utils/constants'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

import { SideBarFaq, FAQLink, SatelliteSideBarStyled, SideBarSection, SideBarItem } from './SatelliteSideBar.style'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

export const SateliteSideBarFAQ = () => (
  <SideBarFaq>
    <h2>Satellite FAQ</h2>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#governance--treasury" target="_blank" rel="noreferrer">
        Who controls Mavryk Finance, and how are decisions made?
      </a>
    </FAQLink>
    <FAQLink>
      <a
        href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
        target="_blank"
        rel="noreferrer"
      >
        What are Satellite’s and what do they do?
      </a>
    </FAQLink>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#the-decentralized-oracle" target="_blank" rel="noreferrer">
        How is the price data secured with the decentralized oracle?
      </a>
    </FAQLink>
    <FAQLink>
      <a
        href="https://mavryk.finance/litepaper#what-is-mvk-and-how-does-it-differ-from-smvk"
        target="_blank"
        rel="noreferrer"
      >
        What is the difference between MVK and Staked MVK (sMVK)?
      </a>
    </FAQLink>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#satellite-delegations " target="_blank" rel="noreferrer">
        How can I be involved with the DAO without setting up my own Satellite?
      </a>
    </FAQLink>
  </SideBarFaq>
)

const SatellitesSideBar = ({ isButton = true }: { isButton?: boolean }) => {
  const { userAddress, isSatellite } = useUserContext()
  const {
    contractAddresses: { delegationAddress, feedsFactoryAddress },
  } = useDappConfigContext()

  const { totalDelegatedMVK, totalActiveSatellites, totalOracleNetworks } = useSatelliteStatistics({
    skipOracleRewardsTotal: true,
  })
  const { rewardsAmount } = useFeedsStats()
  const { feedsAddresses } = useDataFeedsContext()

  const averageRevard =
    convertNumberForClient({ number: rewardsAmount, grade: MVK_DECIMALS }) / Math.max(feedsAddresses.length, 1)

  return (
    <SatelliteSideBarStyled>
      <SideBarSection>
        {isButton ? (
          <Link to="/become-satellite">
            <Button kind={BUTTON_PRIMARY} disabled={!userAddress} form={BUTTON_WIDE}>
              <Icon id="satellite-stroke" /> {isSatellite ? 'Edit Satellite Profile' : 'Become a Satellite'}
            </Button>
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
            <CommaNumber value={totalDelegatedMVK} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Avg. Oracles Rewards MVK</h3>
          <var>{averageRevard ? <CommaNumber value={averageRevard} /> : '-'}</var>
        </SideBarItem>
      </SideBarSection>

      <SateliteSideBarFAQ />
    </SatelliteSideBarStyled>
  )
}

export default SatellitesSideBar

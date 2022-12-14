import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Link } from 'react-router-dom'
import { SatelliteSideBarStyled, SideBarSection, SideBarItem, FAQLink, SideBarFaq } from './SatelliteSideBar.style'

type OraclesSideBarProps = {
  userIsSatellite: boolean
  numberOfSatellites: number
  totalDelegatedMVK: number
  totalOracleNetworks: number
  dataPointsCount: number
  averageRevard?: number
  satelliteFactory: string
  accountPkh?: string
  isButton: boolean
  infoBlockAddresses: {
    satellite: string
    oracle: string
  }
}

export const SateliteSideBarFAQ = () => (
  <SideBarFaq>
    <h2>Satellite FAQ</h2>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#satellite-delegations" target="_blank" rel="noreferrer">
        What is vote delegation and how does it work?
      </a>
    </FAQLink>
    <FAQLink>
      <a
        href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
        target="_blank"
        rel="noreferrer"
      >
        What are the requirements for becoming a Satellite?
      </a>
    </FAQLink>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#mvk-and-vmvk-doorman-module" target="_blank" rel="noreferrer">
        MVK token holder’s delegation agreement
      </a>
    </FAQLink>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#mvk-and-vmvk-doorman-module" target="_blank" rel="noreferrer">
        The MVK holder’s guide to delegation
      </a>
    </FAQLink>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#mvk-and-vmvk-doorman-module" target="_blank" rel="noreferrer">
        Recognized delegate code of conduct
      </a>
    </FAQLink>
  </SideBarFaq>
)

const SatellitesSideBarView = ({
  userIsSatellite,
  isButton,
  totalDelegatedMVK,
  numberOfSatellites,
  totalOracleNetworks,
  infoBlockAddresses,
  averageRevard,
  dataPointsCount,
  accountPkh,
}: OraclesSideBarProps) => {
  return (
    <SatelliteSideBarStyled>
      <SideBarSection>
        {isButton ? (
          <Link to="/become-satellite">
            <Button
              text={userIsSatellite ? 'Edit Satellite Profile' : 'Become a Satellite'}
              icon="satellite-stroke"
              kind={ACTION_PRIMARY}
              disabled={userIsSatellite ? !Boolean(accountPkh) : false}
            />
          </Link>
        ) : null}

        <h2>Info</h2>
        <SideBarItem>
          <h3>Satellite Contract</h3>
          <var>
            {infoBlockAddresses.satellite ? <TzAddress tzAddress={infoBlockAddresses.satellite} hasIcon={true} /> : '-'}
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Oracles Contract</h3>
          <var>
            {infoBlockAddresses.oracle ? <TzAddress tzAddress={infoBlockAddresses.oracle} hasIcon={true} /> : '-'}
          </var>
        </SideBarItem>
      </SideBarSection>

      <SideBarSection>
        <h2>Statistics</h2>
        <SideBarItem>
          <h3>Number of Satellites</h3>
          <var>
            <CommaNumber value={numberOfSatellites} showDecimal={false} />
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>On-Chain Data Points</h3>
          <var>
            <CommaNumber value={dataPointsCount} showDecimal={false} />
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

export default SatellitesSideBarView

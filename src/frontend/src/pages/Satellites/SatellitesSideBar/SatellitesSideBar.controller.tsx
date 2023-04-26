import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { State } from 'reducers'
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { getTotalDelegatedMVK } from '../helpers/Satellites.consts'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'pages/Treasury/Treasury.style'
import { SideBarFaq, FAQLink, SatelliteSideBarStyled, SideBarSection, SideBarItem } from './SatelliteSideBar.style'

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
      <a href="https://mavryk.finance/litepaper#mvk-and-smvk-doorman-module" target="_blank" rel="noreferrer">
        MVK token holder’s delegation agreement
      </a>
    </FAQLink>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#mvk-and-smvk-doorman-module" target="_blank" rel="noreferrer">
        The MVK holder’s guide to delegation
      </a>
    </FAQLink>
    <FAQLink>
      <a href="https://mavryk.finance/litepaper#mvk-and-smvk-doorman-module" target="_blank" rel="noreferrer">
        Recognized delegate code of conduct
      </a>
    </FAQLink>
  </SideBarFaq>
)

const SatellitesSideBar = ({ isButton = true }: { isButton?: boolean }) => {
  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const {
    config: { feedsFactoryAddress },
    feedsLedger,
  } = useSelector((state: State) => state.dataFeeds)
  const { oraclesIds, allSatellitesIds, satelliteMapper } = useSelector((state: State) => state.satellites)
  const { delegationAddress } = useSelector((state: State) => state.contractAddresses)

  const dataPointsCount = useMemo(
    () =>
      feedsLedger?.filter(
        ({ last_completed_data_last_updated_at }) =>
          dayjs(Date.now()).diff(dayjs(last_completed_data_last_updated_at), 'minutes') <= 60,
      ).length,
    [feedsLedger],
  )
  const totalDelegatedMVK = getTotalDelegatedMVK(allSatellitesIds, satelliteMapper)

  const averageRevard = calcWithoutPrecision(
    feedsLedger.reduce((acc, { reward_amount_smvk }) => {
      acc += reward_amount_smvk
      return acc
    }, 0) / Math.max(feedsLedger.length, 1),
  )

  return (
    <SatelliteSideBarStyled>
      <SideBarSection>
        {isButton ? (
          <Link to="/become-satellite">
            <Button
              text={isSatellite ? 'Edit Satellite Profile' : 'Become a Satellite'}
              icon="satellite-stroke"
              kind={ACTION_PRIMARY}
              disabled={!accountPkh}
            />
          </Link>
        ) : null}

        <h2>Info</h2>
        <SideBarItem>
          <h3>Satellite Contract</h3>
          <var>
            {delegationAddress.address ? <TzAddress tzAddress={delegationAddress.address} hasIcon={true} /> : '-'}
          </var>
        </SideBarItem>
        <SideBarItem>
          <h3>Oracles Contract</h3>
          <var>{feedsFactoryAddress ? <TzAddress tzAddress={feedsFactoryAddress} hasIcon={true} /> : '-'}</var>
        </SideBarItem>
      </SideBarSection>

      <SideBarSection>
        <h2>Statistics</h2>
        <SideBarItem>
          <h3>Number of Satellites</h3>
          <var>
            <CommaNumber value={allSatellitesIds.length} showDecimal={false} />
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
            <CommaNumber value={oraclesIds.length} showDecimal={false} />
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

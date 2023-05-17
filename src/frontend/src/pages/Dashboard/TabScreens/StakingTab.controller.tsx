import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { State } from 'reducers'
import { PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

// utils
import { calcExitFee, calcMLI } from 'utils/calcFunctions'

import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Chart } from 'app/App.components/Chart/Chart'
import { AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.types'

import { StatBlock } from '../Dashboard.style'
import {
  StakingContentStyled,
  TabWrapperStyled,
  EmptyContainer,
  StakingHistoryChartWrapper,
} from './DashboardTabs.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

export const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No data to show</figcaption>
  </EmptyContainer>
)

export const StakingTab = ({ isLoading }: { isLoading: boolean }) => {
  const { totalStakedMvk, totalSupply, smvkHistoryData } = useSelector((state: State) => state.doorman)

  const mli = calcMLI(totalSupply, totalStakedMvk)
  const fee = calcExitFee(totalSupply, totalStakedMvk)

  return (
    <TabWrapperStyled backgroundImage="dashboard_stakingTab_bg.png">
      <div className="top">
        <H2Title>Staking</H2Title>
        <Link to="/staking" className="dashboard-sectionLink">
          <NewButton kind={PRIMARY} form={BUTTON_WIDE}>
            <Icon id="staking" />
            Staking
          </NewButton>
        </Link>
      </div>

      {isLoading ? (
        <DataLoaderWrapper className="tabLoader">
          <ClockLoader width={150} height={150} />
          <div className="text">Loading staking</div>
        </DataLoaderWrapper>
      ) : (
        <StakingContentStyled>
          <div className="left">
            <StatBlock>
              <div className="name flexbox">
                Exit Fee
                <CustomTooltip
                  text="The Exit Fee is dynamic, adjusts according to the MLI, and may modified by governance vote. Exit fees are paid directly to sMVK stakeholders for remaining active participants in securing the network. Click to read more."
                  iconId={'info'}
                />
              </div>
              <div className="value">
                <CommaNumber endingText="%" value={fee} />
              </div>
            </StatBlock>
            <StatBlock>
              <div className="name flexbox">
                MVK Loyalty Index
                <CustomTooltip
                  className="tooltip"
                  text="The Mavryk Loyalty Index is a metric that balances MVK & sMVK. The more MVK is staked v.s. MVK, the higher the MLI, and the lower the exit fee is. The less MVK staked v.s. MVK, the lower the MLI, and the exit fee will rise. Click here to read more."
                  iconId={'info'}
                />
              </div>
              <div className="value">
                <CommaNumber endingText="%" value={mli} />
              </div>
            </StatBlock>
          </div>
          <div className="chart-wrapper">
            <div className="title chart-title">Staking History</div>
            <StakingHistoryChartWrapper>
              <Chart
                data={{
                  type: AREA_CHART_TYPE,
                  plots: smvkHistoryData,
                }}
                settings={{
                  height: 100,
                }}
                tooltipAsset={'sMVK'}
              />
            </StakingHistoryChartWrapper>
          </div>
        </StakingContentStyled>
      )}

      <div className="descr">
        <div className="title">Why stake MVK on Mavryk?</div>
        <div className="text">
          You can earn rewards by staking your MVK & delegating your voting rights to a Satellite. Staked MVK helps
          secure Mavryk Finance’s governance & decentralized oracles, by allowing Satellites to vote on business
          decisions & sign data feeds on your behalf. The earned rewards are paid directly to you, minus a small
          Satellite fee. Satellites can never move or spend your tokens, and you may re-delegate to a new Satellite at
          any time.{' '}
          <a href="https://blogs.mavryk.finance/" target="_blank" rel="noreferrer">
            Read More
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}

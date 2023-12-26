import {Link} from 'react-router-dom'

// consts
import {AREA_CHART_TYPE} from 'app/App.components/Chart/helpers/Chart.const'
import {BUTTON_WIDE, PRIMARY} from 'app/App.components/Button/Button.constants'
import {TWENTY_FOUR_HOURS} from 'consts/charts.const'

// utils
import {calcExitFee, calcMLI} from 'utils/calcFunctions'

// hooks
import {useDoormanContext} from 'providers/DoormanProvider/doorman.provider'
import {useDoormanHistory} from 'providers/DoormanProvider/hooks/useDoormanHistory'

// view
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import {ClockLoader} from 'app/App.components/Loader/Loader.view'
import {CommaNumber} from 'app/App.components/CommaNumber/CommaNumber.controller'
import {Chart} from 'app/App.components/Chart/Chart'
import {StatBlock} from '../Dashboard.style'
import {StakingContentStyled, StakingHistoryChartWrapper, TabWrapperStyled} from './DashboardTabs.style'
import {H2Title} from 'styles/generalStyledComponents/Titles.style'
import {DataLoaderWrapper} from 'app/App.components/Loader/Loader.style'
import {getChartXAxisTicks} from 'utils/charts.utils'
import {Tooltip} from 'app/App.components/Tooltip/Tooltip'
import CustomLink from 'app/App.components/CustomLink/CustomLink'

/**
 * TODO: will need only to subscribe to staking chart, and get it's loading here, as staking stats data is subscribed in controller
 */
export const StakingTab = () => {
  const { totalSupply, totalStakedMvk, isLoading: isStakingLoading } = useDoormanContext()

  const { smvkHistoryData, isLoading: isChartsDataLoading, noChartData } = useDoormanHistory(TWENTY_FOUR_HOURS)

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

      {isStakingLoading ? (
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
                <CustomLink to="https://docs.mavryk.finance/mavryk-finance/staking/benefits-and-fees-of-staking#exit-fee">
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Icon id="info" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      The Exit Fee is dynamic, adjusts according to the MLI, and may modified by governance vote. Exit
                      fees are paid directly to sMVK stakeholders for remaining active participants in securing the
                      network. Click to read more.
                    </Tooltip.Content>
                  </Tooltip>
                </CustomLink>
              </div>
              <div className="value">
                <CommaNumber endingText="%" value={fee} />
              </div>
            </StatBlock>
            <StatBlock>
              <div className="name flexbox">
                MVK Loyalty Index
                <CustomLink to="https://docs.mavryk.finance/mavryk-finance/staking/benefits-and-fees-of-staking">
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Icon id="info" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      The Mavryk Loyalty Index is a metric that balances MVK & sMVK. The more MVK is staked v.s. MVK,
                      the higher the MLI, and the lower the exit fee is. The less MVK staked v.s. MVK, the lower the
                      MLI, and the exit fee will rise. Click to read more.
                    </Tooltip.Content>
                  </Tooltip>
                </CustomLink>
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
                isLoading={isChartsDataLoading}
                numberOfItemsToDisplay={smvkHistoryData.length && !noChartData ? smvkHistoryData.length : 10}
                data={{
                  type: AREA_CHART_TYPE,
                  plots: smvkHistoryData,
                }}
                settings={{
                  height: 100,
                  tickDateFormatter: (date: number) => getChartXAxisTicks(date, TWENTY_FOUR_HOURS),
                }}
                tooltipAsset={'sMVK'}
              />
            </StakingHistoryChartWrapper>
          </div>
        </StakingContentStyled>
      )}

      <div className="descr">
        <div className="title">Why stake MVN on Maven?</div>
        <div className="text">
          You can earn rewards by staking your MVN & delegating your voting rights to a Satellite. Staked MVN helps
          secure Maven Finance’s governance & decentralized oracles, by allowing Satellites to vote on business
          decisions & sign data feeds on your behalf. The earned rewards are paid directly to you, minus a small
          Satellite fee. Satellites can never move or spend your tokens, and you may re-delegate to a new Satellite at
          any time.{' '}
          <a
            href="https://docs.mavryk.finance/mavryk-finance/staking/benefits-and-fees-of-staking"
            target="_blank"
            rel="noreferrer"
          >
            Read More
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}

import { useEffect } from 'react'
import { Link } from 'react-router-dom'

// consts
import { BUTTON_LARGE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { LOANS_MARKETS_DATA, DEFAULT_LOANS_ACTIVE_SUBS } from 'providers/LoansProvider/helpers/loans.const'

// types
import { UserLoansData } from 'providers/UserProvider/user.provider.types'

// hooks
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { useLoansGaugeChartData } from 'providers/LoansProvider/hooks/useLoansGaugeChartData'

// view
import { LBHInfoBlock } from './DashboardPersonalComponents.style'
import { LoansPositionTable } from 'pages/LoansDashboard/components/PositionTable'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { GaugeChart } from 'app/App.components/GaugeChart/GaugeChart'
import Button from 'app/App.components/Button/NewButton'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

export const LendBorrowPosition = ({
  userLoansRewards,
  totalUserBorrowed,
  totalUserLended,
  userVaultsData,
  isUserLoansLoading,
}: {
  totalUserBorrowed: number
  totalUserLended: number
  userVaultsData: UserLoansData['userVaultsData']
  userLoansRewards: number
  isUserLoansLoading: boolean
}) => {
  const { changeLoansSubscriptionsList, isLoading: isLoansLoading } = useLoansContext()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
    })

    return () => changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
  }, [])

  const { gaugeData, setApyData, setVaultsData } = useLoansGaugeChartData({ userVaultsData })

  return (
    <LBHInfoBlock className="position-tab">
      <H2Title>Earn/Borrow Position</H2Title>
      <div className="view-markets">
        <Link to={'/loans'}>
          <Button kind={BUTTON_PRIMARY} size={BUTTON_LARGE}>
            View Markets
          </Button>
        </Link>
      </div>

      {isUserLoansLoading || isLoansLoading ? (
        <div className="loader-wrapper">
          <ClockLoader />
        </div>
      ) : (
        <>
          <div className="acc-stats">
            <div className="gauge-chart">
              <Tooltip>
                <Tooltip.Trigger className="tooltip-trigger">
                  <Icon id="info" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  Risk value indicates how risky your portfolio is. When the risk value reaches 100, your collateral
                  will be liquidated. Risk value = Total Borrow/Borrow Limit*100 Net APY = [Σ(Value of Supplied
                  Assets*Supply APY) - Σ(Value of Borrowed Assets*Borrow APY)] / Value of Supplied Assets
                </Tooltip.Content>
              </Tooltip>
              <GaugeChart
                maxValue={gaugeData.maxValue}
                minValue={gaugeData.minValue}
                currentValue={gaugeData.currentValue}
                isProgress={gaugeData.isAPY}
              >
                <div
                  className={`lend-borrow-position ${gaugeData.status ?? ''}`}
                  onMouseEnter={setVaultsData}
                  onMouseLeave={setApyData}
                >
                  <CommaNumber
                    value={gaugeData.currentValue}
                    className="amount"
                    endingText={gaugeData.isAPY ? '%' : ''}
                    showDecimal={false}
                  />
                  <div className="status">{gaugeData.text}</div>
                </div>
              </GaugeChart>
            </div>

            <div className="stats">
              <div className="column">
                <div className="name">Total Supplied</div>
                <CommaNumber value={totalUserLended} className="value" beginningText="$" />
              </div>

              <div className="column">
                <div className="name">Total Borrowed</div>
                <CommaNumber value={totalUserBorrowed} className="value" beginningText="$" />
              </div>

              <div className="column">
                <div className="name">Earned To Date</div>
                <CommaNumber value={userLoansRewards} className="value" beginningText="$" />
              </div>
            </div>
          </div>

          <LoansPositionTable userVaultsData={userVaultsData} />
        </>
      )}
    </LBHInfoBlock>
  )
}

import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

// consts
import { BUTTON_LARGE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { LOANS_MARKETS_DATA, DEFAULT_LOANS_ACTIVE_SUBS } from 'providers/LoansProvider/helpers/loans.const'
import { getClassNameBasedOnPersentValue } from './helpers/comparing.helpers'

// view
import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { LoansPositionTable } from './components/PositionTable'
import { GaugeChart } from 'app/App.components/GaugeChart/GaugeChart'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { LBHInfoBlock } from 'pages/DashboardPersonal/DashboardPersonalComponents/DashboardPersonalComponents.style'
import { Page } from 'styles'
import { AccountStyledStyled, LoansDashboardStyled, TotalVolumeStyled } from './LoansDashboard.styles'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import Icon from 'app/App.components/Icon/Icon.view'
import ConnectWalletBtn from 'app/App.components/ConnectWallet/ConnectWalletBtn'

// utils
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import useUserLoansData from 'providers/UserProvider/hooks/useUserLoansData'
import useLendBorrow24hDiff from 'providers/LoansProvider/hooks/useLendBorrow24hDiff'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { useLoansGaugeChartData } from 'providers/LoansProvider/hooks/useLoansGaugeChartData'

export const LoansDashboard = () => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { marketsAddresses, marketsMapper, isLoading: isLoansLoading, changeLoansSubscriptionsList } = useLoansContext()
  const {
    userAddress,
    availableLoansRewards,
    userAvatars: { mainAvatar },
  } = useUserContext()

  const { isLoading: is24hDiffLoading, lending24hPersentChange, borrowing24hPersentChange } = useLendBorrow24hDiff()
  const { isLoading: userLoansDataLoading, userVaultsData, totalUserBorrowed, totalUserLended } = useUserLoansData()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
    })

    return () => {
      changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
    }
  }, [])

  const { gaugeData, setApyData, setVaultsData } = useLoansGaugeChartData({ userVaultsData })

  const { totalBorrowed, totalLended } = useMemo(
    () =>
      marketsAddresses.reduce(
        (acc, marketTokenAddress) => {
          const market = marketsMapper[marketTokenAddress]
          const token = getTokenDataByAddress({ tokenAddress: marketTokenAddress, tokensMetadata, tokensPrices })

          if (!token || !token.rate || !market) return acc
          const { totalLended, totalBorrowed } = market

          const { decimals, rate } = token

          acc.totalBorrowed += convertNumberForClient({ number: totalBorrowed, grade: decimals }) * rate
          acc.totalLended += convertNumberForClient({ number: totalLended, grade: decimals }) * rate

          return acc
        },
        {
          totalLended: 0,
          totalBorrowed: 0,
        },
      ),
    [marketsAddresses, marketsMapper, tokensMetadata, tokensPrices],
  )

  return (
    <Page>
      <PageHeader page={'loansDashboard'} avatar={mainAvatar} />

      <LoansDashboardStyled>
        {isLoansLoading || userLoansDataLoading || is24hDiffLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading earn & borrow data</div>
          </DataLoaderWrapper>
        ) : (
          <>
            <div className="top">
              <TotalVolumeStyled>
                <H2Title>Total Volume</H2Title>

                <CommaNumber value={totalLended + totalBorrowed} beginningText="$" className="total-amount" />

                <div className="details">
                  <div className="column">
                    <div className="label">Total Earning</div>
                    <div className="value-wrap">
                      <CommaNumber value={totalLended} beginningText="$" className="value" />
                      <CommaNumber
                        value={lending24hPersentChange}
                        endingText="% 24h"
                        beginningText={lending24hPersentChange > 0 ? '+' : ''}
                        className={`diff ${getClassNameBasedOnPersentValue(lending24hPersentChange)}`}
                      />
                    </div>
                  </div>

                  <div className="column">
                    <div className="label">Total Borrow</div>
                    <div className="value-wrap">
                      <CommaNumber value={totalBorrowed} beginningText="$" className="value" />
                      <CommaNumber
                        value={borrowing24hPersentChange}
                        endingText="% 24h"
                        beginningText={borrowing24hPersentChange > 0 ? '+' : ''}
                        className={`diff ${getClassNameBasedOnPersentValue(borrowing24hPersentChange)}`}
                      />
                    </div>
                  </div>
                </div>
              </TotalVolumeStyled>

              <AccountStyledStyled>
                <H2Title>Account Status</H2Title>

                <div className="content">
                  <div className="gauge-chart">
                    <div className="tooltip-wrapper">
                      <Tooltip>
                        <Tooltip.Trigger className="ml-3">
                          <Icon id="info" />
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          Risk value indicates how risky your portfolio is. When the risk value reaches 100, your
                          collateral will be liquidated. Risk value = Total Borrow/Borrow Limit*100 Net APY = [Σ(Value
                          of Supplied Assets*Supply APY) - Σ(Value of Borrowed Assets*Borrow APY)] / Value of Supplied
                          Assets
                        </Tooltip.Content>
                      </Tooltip>
                    </div>

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
                        />
                        <div className="status">{gaugeData.text}</div>
                      </div>
                    </GaugeChart>
                  </div>

                  <div className="details">
                    <div className="column">
                      <div className="label">Total Supplied</div>
                      <CommaNumber value={totalUserLended} beginningText="$" className="value" />
                    </div>
                    <div className="column">
                      <div className="label">Total Borrow</div>
                      <CommaNumber value={totalUserBorrowed} beginningText="$" className="value" />
                    </div>
                    <div className="column">
                      <div className="label">Earned To Date</div>
                      <CommaNumber value={availableLoansRewards} beginningText="$" className="value" />
                    </div>
                  </div>
                </div>
              </AccountStyledStyled>
            </div>

            <LBHInfoBlock className="position">
              <H2Title>Your Positions</H2Title>
              <div className="view-markets">
                {userAddress ? (
                  <Link to={'/loans'}>
                    <Button kind={BUTTON_PRIMARY} size={BUTTON_LARGE}>
                      View Markets
                    </Button>
                  </Link>
                ) : (
                  <ConnectWalletBtn />
                )}
              </div>
              <LoansPositionTable userVaultsData={userVaultsData} />
            </LBHInfoBlock>
          </>
        )}
      </LoansDashboardStyled>
    </Page>
  )
}

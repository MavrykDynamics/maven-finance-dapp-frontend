import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { State } from 'reducers'

import { BUTTON_LARGE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { getGaugeVaultRiskSimpleStatus } from './helpers/position.helpers'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'

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
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import colors from 'styles/colors'
import { connect } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import Icon from 'app/App.components/Icon/Icon.view'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import useLendBorrow24hDiff from 'providers/LoansProvider/hooks/useLendBorrow24hDiff'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import useUserLoansData from 'providers/UserProvider/hooks/useUserLoansData'
import { getMarketUserLengingItem } from 'providers/LoansProvider/helpers/loans.utils'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

export type GaugeChartStateType = {
  maxValue: number
  minValue: number
  currentValue: number
  text: string
  isAPY: boolean
  status: string | null
}

export const GAUGE_STATE_RISK_PART = {
  maxValue: 100,
  minValue: 0,
  isAPY: false,
}

export const GAUGE_STATE_APY_PART = {
  maxValue: 100,
  minValue: 0,
  isAPY: true,
  text: 'Net APY',
  status: null,
}

export const LoansDashboard = () => {
  const dispatch = useDispatch()

  const { tokensMetadata, tokensPrices } = useTokensContext()

  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { isDataLoaded: isLoansLoaded, loanTokens } = useSelector((state: State) => state.loans)

  const { lending24hPersentChange, borrowing24hPersentChange } = useLendBorrow24hDiff()

  const {
    accountPkh,
    user: {
      availableLoansRewards,
      userMTokens,
      userAvatars: { mainAvatar },
    },
  } = useSelector((state: State) => state.wallet)

  const { totalBorrowed, totalLended } = loanTokens.reduce<{
    totalLended: number
    totalBorrowed: number
  }>(
    (acc, { totalBorrowed, totalLended, loanTokenAddress }) => {
      const token = getTokenDataByAddress({ tokenAddress: loanTokenAddress, tokensMetadata, tokensPrices })
      if (!token || !token.rate) return acc

      const { decimals, rate } = token

      acc.totalBorrowed += convertNumberForClient({ number: totalBorrowed, grade: decimals }) * rate
      acc.totalLended += convertNumberForClient({ number: totalLended, grade: decimals }) * rate
      return acc
    },
    {
      totalLended: 0,
      totalBorrowed: 0,
    },
  )

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        if (!isLoansLoaded || isDepsChanged) {
          await dispatch(getLoansStorage())
        }
      } catch (e) {}
    },
    [accountPkh],
  )

  const {
    isLoading: userLoansDataLoading,
    userVaultsData,
    totalUserBorrowed,
    totalUserLended,
  } = useUserLoansData({ userAddress: accountPkh })

  // calc data for gauge chart
  const { vaultRiskGaugeData, apyGaugeData } = useMemo((): {
    vaultRiskGaugeData: GaugeChartStateType
    apyGaugeData: GaugeChartStateType
  } => {
    const { borrowedAmount, borrowCapacity, totalSuppliedValue, sumOfRatioSuppliedToAPY, sumOfRatioBorrowedToAPR } =
      loanTokens.reduce<{
        borrowedAmount: number
        borrowCapacity: number
        totalSuppliedValue: number
        sumOfRatioSuppliedToAPY: number
        sumOfRatioBorrowedToAPR: number
      }>(
        (acc, { borrowAPR, lendingAPY, loanMTokenAddress, loanTokenAddress }) => {
          const token = getTokenDataByAddress({ tokenAddress: loanTokenAddress, tokensMetadata, tokensPrices })
          if (!token || !token.rate) return acc

          let borrowedPerMarket = 0

          const { lendValue } = getMarketUserLengingItem(userMTokens, loanMTokenAddress) ?? { lendValue: 0 }

          const { decimals, rate } = token

          const conveterLendValue = convertNumberForClient({ number: lendValue, grade: decimals })

          const { borrowedAmount = 0, collateralAmount = 0 } = userVaultsData[loanTokenAddress] ?? {}

          // calculating value risk data & how much borrowed per vault
          acc.borrowCapacity += collateralAmount / 2 - borrowedAmount
          acc.borrowedAmount += borrowedAmount
          borrowedPerMarket += borrowedAmount

          // calculating net APY supplied & borrowed ratio's
          acc.sumOfRatioSuppliedToAPY += conveterLendValue * rate * lendingAPY
          acc.sumOfRatioBorrowedToAPR += borrowedPerMarket * borrowAPR
          acc.totalSuppliedValue += conveterLendValue * rate
          return acc
        },
        {
          borrowedAmount: 0,
          borrowCapacity: 0,
          totalSuppliedValue: 0,
          sumOfRatioSuppliedToAPY: 0,
          sumOfRatioBorrowedToAPR: 0,
        },
      )

    const vaultRiskValue = !accountPkh || !borrowCapacity ? 0 : (borrowedAmount / borrowCapacity) * 100
    const apyNet =
      !accountPkh || !totalSuppliedValue ? 0 : (sumOfRatioSuppliedToAPY - sumOfRatioBorrowedToAPR) / totalSuppliedValue

    return {
      vaultRiskGaugeData: {
        ...GAUGE_STATE_RISK_PART,
        currentValue: vaultRiskValue,
        ...getGaugeVaultRiskSimpleStatus(vaultRiskValue),
      },
      apyGaugeData: {
        ...GAUGE_STATE_APY_PART,
        currentValue: apyNet,
      },
    }
  }, [loanTokens, accountPkh, userMTokens, tokensMetadata, tokensPrices, userVaultsData])

  // Default data for gauge chart will be for vault risk
  const [gaugeData, setGaugeData] = useState<GaugeChartStateType>({
    ...GAUGE_STATE_RISK_PART,
    currentValue: 0,
    text: '',
    status: null,
  })

  // Set gauge chart data for vault risk
  useEffect(() => {
    if (!gaugeData.isAPY) {
      setGaugeData(vaultRiskGaugeData)
    }
  }, [vaultRiskGaugeData])

  return (
    <Page>
      <PageHeader page={'loansDashboard'} avatar={mainAvatar} />

      <LoansDashboardStyled>
        {isLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading lend & borrow data</div>
          </DataLoaderWrapper>
        ) : (
          <>
            <div className="top">
              <TotalVolumeStyled>
                <H2Title>Total Volume</H2Title>

                <CommaNumber value={totalLended + totalBorrowed} beginningText="$" className="total-amount" />

                <div className="details">
                  <div className="column">
                    <div className="label">Total Lending</div>
                    <div className="value-wrap">
                      <CommaNumber value={totalLended} beginningText="$" className="value" />
                      <CommaNumber
                        value={lending24hPersentChange}
                        endingText="% 24h"
                        beginningText={lending24hPersentChange > 0 ? '+' : ''}
                        className={`diff ${
                          lending24hPersentChange ? (lending24hPersentChange > 0 ? 'up' : 'down') : 'neutral'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="column">
                    <div className="label">Total Borrowed</div>
                    <div className="value-wrap">
                      <CommaNumber value={totalBorrowed} beginningText="$" className="value" />
                      <CommaNumber
                        value={borrowing24hPersentChange}
                        endingText="% 24h"
                        beginningText={borrowing24hPersentChange > 0 ? '+' : ''}
                        className={`diff ${
                          borrowing24hPersentChange ? (borrowing24hPersentChange > 0 ? 'up' : 'down') : 'neutral'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </TotalVolumeStyled>

              <AccountStyledStyled>
                <H2Title>Account Status</H2Title>

                <div className="content">
                  <div className="gauge-chart">
                    <CustomTooltip
                      iconId="info"
                      text="Risk value indicates how risky your portfolio is. When the risk value reaches 100, your collateral will be liquidated. 
                      Risk value = Total Borrow/Borrow Limit*100 
                      Net APY = [Σ(Value of Supplied Assets*Supply APY) - Σ(Value of Borrowed Assets*Borrow APY)] / Value of Supplied Assets"
                      defaultStrokeColor={colors[themeSelected].textColor}
                      className="tooltip"
                    />
                    <GaugeChart
                      maxValue={gaugeData.maxValue}
                      minValue={gaugeData.minValue}
                      currentValue={gaugeData.currentValue}
                      isProgress={gaugeData.isAPY}
                    >
                      <div
                        className={`lend-borrow-position ${gaugeData.status ?? ''}`}
                        onMouseEnter={() => setGaugeData(apyGaugeData)}
                        onMouseLeave={() => setGaugeData(vaultRiskGaugeData)}
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

                  <div className="details">
                    <div className="column">
                      <div className="label">Total Lend</div>
                      <CommaNumber value={totalUserLended} beginningText="$" className="value" />
                    </div>
                    <div className="column">
                      <div className="label">Total Borrow</div>
                      <CommaNumber value={totalUserBorrowed} beginningText="$" className="value" />
                    </div>
                    <div className="column">
                      <div className="label">Rewards to be Distrubuted</div>
                      <CommaNumber value={availableLoansRewards} beginningText="$" className="value" />
                    </div>
                  </div>
                </div>
              </AccountStyledStyled>
            </div>

            <LBHInfoBlock className="position">
              <H2Title>Your Positions</H2Title>
              <div className="view-markets">
                {accountPkh ? (
                  <Link to={'/loans'}>
                    <Button kind={BUTTON_PRIMARY} size={BUTTON_LARGE}>
                      View Markets
                    </Button>
                  </Link>
                ) : (
                  <Button kind={BUTTON_PRIMARY} size={BUTTON_LARGE} onClick={() => dispatch(connect())}>
                    <Icon id="wallet" />
                    Connect Wallet
                  </Button>
                )}
              </div>
              <LoansPositionTable markets={loanTokens} userVaultsData={userVaultsData} />
            </LBHInfoBlock>
          </>
        )}
      </LoansDashboardStyled>
    </Page>
  )
}

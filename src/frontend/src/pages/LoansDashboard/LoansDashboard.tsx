import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { BUTTON_LARGE, BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { getNumberInBounds } from 'utils/calcFunctions'
import { getGaugeVaultRiskSimpleStatus } from './helpers/position.helpers'
import { getClassNameBasedOnPersentValue } from './helpers/comparing.helpers'

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
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import useLendBorrow24hDiff from 'providers/LoansProvider/hooks/useLendBorrow24hDiff'
import useUserLoansData from 'providers/UserProvider/hooks/useUserLoansData'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import ConnectWalletBtn from 'app/App.components/ConnectWallet/ConnectWalletBtn'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { LOANS_MARKETS_DATA, DEFAULT_LOANS_ACTIVE_SUBS } from 'providers/LoansProvider/helpers/loans.const'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

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
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    userAddress,
    availableLoansRewards,
    userAvatars: { mainAvatar },
    userMTokens,
  } = useUserContext()
  const { marketsAddresses, marketsMapper, isLoading: isLoansLoading, changeLoansSubscriptionsList } = useLoansContext()

  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const { lending24hPersentChange, borrowing24hPersentChange } = useLendBorrow24hDiff()

  const { isLoading: userLoansDataLoading, userVaultsData, totalUserBorrowed, totalUserLended } = useUserLoansData()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
    })

    return () => {
      changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
    }
  }, [])

  // calc data for gauge chart
  const { vaultRiskGaugeData, apyGaugeData, totalBorrowed, totalLended } = useMemo((): {
    vaultRiskGaugeData: GaugeChartStateType
    apyGaugeData: GaugeChartStateType
    totalLended: number
    totalBorrowed: number
  } => {
    const {
      borrowedAmount,
      collateralAmount,
      totalSuppliedValue,
      sumOfRatioSuppliedToAPY,
      sumOfRatioBorrowedToAPR,
      totalLended,
      totalBorrowed,
    } = marketsAddresses.reduce(
      (acc, marketTokenAddress) => {
        const market = marketsMapper[marketTokenAddress]
        const token = getTokenDataByAddress({ tokenAddress: marketTokenAddress, tokensMetadata, tokensPrices })

        if (!token || !token.rate || !market) return acc
        const { borrowAPR, lendingAPY, loanMTokenAddress, loanTokenAddress, totalLended, totalBorrowed } = market

        const { lendValue } = userMTokens[loanMTokenAddress] ?? { lendValue: 0 }

        const { decimals, rate } = token

        const { principle = 0, borrowedVaultsCollateralBalance = 0 } = userVaultsData[loanTokenAddress] ?? {}

        acc.totalBorrowed += convertNumberForClient({ number: totalBorrowed, grade: decimals }) * rate
        acc.totalLended += convertNumberForClient({ number: totalLended, grade: decimals }) * rate

        //  calculating value risk data & how much borrowed per vault
        acc.collateralAmount += borrowedVaultsCollateralBalance
        acc.borrowedAmount += principle

        // calculating net APY supplied & borrowed ratio's
        acc.sumOfRatioSuppliedToAPY += lendValue * rate * lendingAPY
        acc.sumOfRatioBorrowedToAPR += principle * borrowAPR
        acc.totalSuppliedValue += lendValue * rate
        return acc
      },
      {
        totalLended: 0,
        totalBorrowed: 0,
        borrowedAmount: 0,
        collateralAmount: 0,
        totalSuppliedValue: 0,
        sumOfRatioSuppliedToAPY: 0,
        sumOfRatioBorrowedToAPR: 0,
      },
    )

    const vaultRiskValue = !userAddress || !collateralAmount ? 0 : (borrowedAmount / collateralAmount) * 100
    const apyNet =
      !userAddress || !totalSuppliedValue ? 0 : (sumOfRatioSuppliedToAPY - sumOfRatioBorrowedToAPR) / totalSuppliedValue

    return {
      vaultRiskGaugeData: {
        ...GAUGE_STATE_RISK_PART,
        currentValue: getNumberInBounds(0, 100, vaultRiskValue),
        ...getGaugeVaultRiskSimpleStatus(vaultRiskValue),
      },
      apyGaugeData: {
        ...GAUGE_STATE_APY_PART,
        currentValue: getNumberInBounds(0, 100, apyNet),
      },
      totalBorrowed,
      totalLended,
    }
  }, [marketsAddresses, userAddress, marketsMapper, tokensMetadata, tokensPrices, userMTokens, userVaultsData])

  // Default data for gauge chart will be for vault risk
  const [gaugeData, setGaugeData] = useState<GaugeChartStateType>({
    ...GAUGE_STATE_APY_PART,
    currentValue: 0,
    text: '',
    status: null,
  })

  // Set gauge chart data for vault risk
  useEffect(() => {
    if (gaugeData.isAPY) {
      setGaugeData(apyGaugeData)
    }
  }, [apyGaugeData])

  return (
    <Page>
      <PageHeader page={'loansDashboard'} avatar={mainAvatar} />

      <LoansDashboardStyled>
        {isLoansLoading || userLoansDataLoading ? (
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
                        onMouseEnter={() => setGaugeData(vaultRiskGaugeData)}
                        onMouseLeave={() => setGaugeData(apyGaugeData)}
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

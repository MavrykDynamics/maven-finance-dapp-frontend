import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// utils
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getPieChartData } from 'app/App.components/Chart/helpers/getPieChartData'

// consts
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import PieChartView from 'app/App.components/PieChart/PieСhart.view'
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableScrollable,
} from 'app/App.components/Table'
import { BGPrimaryTitle } from 'pages/ContractStatuses/ContractStatuses.style'
import { StatBlock, BlockName } from '../Dashboard.style'
import { EmptyContainer, TabWrapperStyled, VaultsContentStyled } from './DashboardTabs.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { convertNumberForClient } from 'utils/calcFunctions'
import { useVaultsDashboardData } from 'providers/VaultsProvider/hooks/useVaultsDashboardData'

export const VaultsTab = () => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    isLoading: isVaultsTabDataLoading,
    totalCollateralRatio,
    averageCollateralRatio,
    vaultTvl,
    activeVaults,
    reducedVaultsCollaterals,
  } = useVaultsDashboardData()

  const [hoveredPath, setHoveredPath] = useState<null | string>(null)

  const chartData = useMemo(() => {
    const reducedCollateralsIntoChart = getPieChartData(
      reducedVaultsCollaterals,
      vaultTvl,
      hoveredPath,
      tokensMetadata,
      tokensPrices,
    )
    const isEmptyChart = reducedCollateralsIntoChart.length === 1 && reducedCollateralsIntoChart[0].value === 0
    return isEmptyChart
      ? [
          {
            ...reducedCollateralsIntoChart[0],
            value: 1,
          },
        ]
      : reducedCollateralsIntoChart
  }, [hoveredPath, reducedVaultsCollaterals, tokensMetadata, tokensPrices, vaultTvl])

  return (
    <TabWrapperStyled className="vaults">
      <div className="top">
        <BGPrimaryTitle>Vaults</BGPrimaryTitle>
        <Link to="/vaults/all">
          <Button text="Vaults" icon="vaults" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>
      {isVaultsTabDataLoading ? (
        <DataLoaderWrapper className="tabLoader">
          <ClockLoader width={150} height={150} />
          <div className="text">Loading vaults</div>
        </DataLoaderWrapper>
      ) : reducedVaultsCollaterals.length ? (
        <VaultsContentStyled>
          <div className="top">
            <StatBlock>
              <div className="name">Active Vaults</div>
              <div className="value">
                <CommaNumber value={activeVaults} />
              </div>
            </StatBlock>
            <StatBlock>
              <div className="name">Collateral Ratio</div>
              <div className="value">
                <CommaNumber endingText="%" value={totalCollateralRatio} />
              </div>
            </StatBlock>
            <StatBlock>
              <div className="name">Avg. Collateral Ratio</div>
              <div className="value">
                <CommaNumber endingText="%" value={averageCollateralRatio} />
              </div>
            </StatBlock>
          </div>

          <div className="container">
            <div>
              <BlockName>Vaults Assets</BlockName>

              <TableScrollable bodyHeight={90} className="treasury-table scroll-block">
                <Table>
                  <TableHeader className="treasury">
                    <TableRow>
                      <TableHeaderCell>Asset</TableHeaderCell>
                      <TableHeaderCell>Amount</TableHeaderCell>
                      <TableHeaderCell contentPosition="right">USD Value</TableHeaderCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="treasury">
                    {reducedVaultsCollaterals.map(({ tokenAddress, balance }) => {
                      const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
                      if (!token || !token.rate) return null

                      const { symbol, rate, decimals } = token

                      const convertedBalance = convertNumberForClient({ number: balance, grade: decimals })

                      return (
                        <TableRow key={symbol} rowHeight={25} borderColor="primaryText" className="add-hover">
                          <TableCell width="33%">{symbol}</TableCell>
                          <TableCell width="33%">
                            <CommaNumber
                              value={convertedBalance}
                              decimalsToShow={Number(decimals)}
                              useAccurateParsing={convertedBalance < 1}
                            />
                          </TableCell>
                          <TableCell width="33%" contentPosition="right">
                            <CommaNumber
                              value={convertedBalance * rate}
                              beginningText={rate ? '$' : symbol}
                              useAccurateParsing={convertedBalance < 1}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableScrollable>

              <div className="summary">
                <div className="name">Vault TVL</div>
                <div className="value">
                  <CommaNumber beginningText="$" value={vaultTvl} />
                </div>
              </div>
            </div>
            <div className="chart-wrapper">
              <PieChartView chartData={chartData} />

              <div className="asset-lables scroll-block">
                {reducedVaultsCollaterals.map(({ tokenAddress }) => {
                  const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
                  if (!token || !token.rate) return null

                  const { symbol } = token
                  return (
                    <div
                      style={{
                        background: `linear-gradient(90deg,${
                          chartData.find(({ title }) => title === symbol || title.includes(symbol))?.color
                        } 0%,rgba(255,255,255,0) 100%)`,
                      }}
                      className="asset-lable"
                      onMouseEnter={() => setHoveredPath(symbol)}
                      onMouseLeave={() => setHoveredPath(null)}
                      key={symbol}
                    >
                      <p className="asset-lable-text">{symbol}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </VaultsContentStyled>
      ) : (
        <EmptyContainer>
          <img src="/images/not-found.svg" alt=" No collaterals to show" />
          <figcaption> No collaterals to show</figcaption>
        </EmptyContainer>
      )}

      <div className="descr">
        <div className="title">What is a Vault?</div>
        <div className="text">
          Mavryk Finance’s vaults are non-custodial smart contracts and are direct between the vault owner and smart
          contract. In order to borrow, users must open a vault and deposit collateral.{' '}
          <a href="https://blogs.mavryk.finance/" target="_blank" rel="noreferrer">
            Read More
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}

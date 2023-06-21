import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { State } from 'reducers'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { emptyContainer } from './LendingTab.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import PieChartView from 'app/App.components/PieСhart/PieСhart.view'

import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableScrollable,
} from 'app/App.components/Table'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { StatBlock, BlockName } from '../Dashboard.style'
import { TabWrapperStyled, VaultsContentStyled } from './DashboardTabs.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getPieChartData } from 'app/App.components/Chart/helpers/getPieChartData'
import { reduceVaultsAssets } from 'providers/LoansProvider/helpers/vaults.utils'

export const VaultsTab = ({ isLoading }: { isLoading: boolean }) => {
  const [hoveredPath, setHoveredPath] = useState<null | string>(null)

  const { tokensMetadata, tokensPrices } = useTokensContext()

  const { allVaultsIds, vaultsMapper } = useSelector((state: State) => state.loans.vaults)
  const { assetsBalances, globalVaultTVL, collateralRatio, avgCollateralRatio } = useMemo(
    () => reduceVaultsAssets(allVaultsIds, vaultsMapper, tokensMetadata, tokensPrices),
    [allVaultsIds, tokensMetadata, tokensPrices, vaultsMapper],
  )

  const chartData = useMemo(() => {
    return getPieChartData(assetsBalances, globalVaultTVL, hoveredPath, tokensMetadata, tokensPrices)
  }, [assetsBalances, globalVaultTVL, hoveredPath, tokensMetadata, tokensPrices])

  return (
    <TabWrapperStyled className="vaults">
      <div className="top">
        <BGPrimaryTitle>Vaults</BGPrimaryTitle>
        <Link to="/vaults/all">
          <Button text="Vaults" icon="vaults" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>
      {isLoading ? (
        <DataLoaderWrapper className="tabLoader">
          <ClockLoader width={150} height={150} />
          <div className="text">Loading vaults</div>
        </DataLoaderWrapper>
      ) : assetsBalances.length ? (
        <VaultsContentStyled>
          <div className="top">
            <StatBlock>
              <div className="name">Active Vaults</div>
              <div className="value">
                <CommaNumber value={allVaultsIds.length} />
              </div>
            </StatBlock>
            <StatBlock>
              <div className="name">Collateral Ratio</div>
              <div className="value">
                <CommaNumber endingText="%" value={collateralRatio} />
              </div>
            </StatBlock>
            <StatBlock>
              <div className="name">Avg. Collateral Ratio</div>
              <div className="value">
                <CommaNumber endingText="%" value={avgCollateralRatio} />
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
                    {assetsBalances.map(({ balance, tokenAddress }) => {
                      const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
                      if (!token || !token.rate) return null

                      const { symbol, rate, decimals } = token

                      const convertedBalance = convertNumberForClient({ number: balance, grade: decimals })

                      return (
                        <TableRow key={symbol} rowHeight={25} borderColor="dataColor" className="add-hover">
                          <TableCell width="33%">{symbol}</TableCell>
                          <TableCell width="33%">
                            <CommaNumber
                              value={convertedBalance}
                              decimalsToShow={assetDecimalsToShow}
                              useAccurateParsing
                            />
                          </TableCell>
                          <TableCell width="33%" contentPosition="right">
                            <CommaNumber
                              value={convertedBalance * rate}
                              beginningText={rate ? '$' : symbol}
                              useAccurateParsing
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
                  <CommaNumber beginningText="$" value={globalVaultTVL} />
                </div>
              </div>
            </div>
            <div className="chart-wrapper">
              <PieChartView chartData={chartData} />

              <div className="asset-lables scroll-block">
                {assetsBalances.map(({ tokenAddress }) => {
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
                      onMouseEnter={() => {
                        setHoveredPath(symbol)
                      }}
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
        emptyContainer
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

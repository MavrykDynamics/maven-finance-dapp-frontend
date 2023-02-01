import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import PieChartView from 'app/App.components/PieСhart/PieСhart.view'
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableScrollable,
} from 'app/App.components/Table/Table.style'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { getPieChartData } from 'pages/Treasury/helpers/calculateChartData'
import { State } from 'reducers'
import { StatBlock, BlockName } from '../Dashboard.style'
import { TabWrapperStyled, VaultsContentStyled } from './DashboardTabs.style'
import { emptyContainer } from './LendingTab.controller'
import { reduceVaultsAssets } from 'pages/Vaults/Vaults.helpers'

export const VaultsTab = () => {
  const [hoveredPath, setHoveredPath] = useState<null | string>(null)

  const { vaultsList: { allVaultsIds, vaultsMapper } } = useSelector((state: State) => state.vaults)
  const { assetsBalances, globalVaultTVL, avgCollateralRatio } = useMemo(() => reduceVaultsAssets(allVaultsIds, vaultsMapper), [allVaultsIds, vaultsMapper])
  
  const chartData = useMemo(() => {
    return getPieChartData(assetsBalances, globalVaultTVL, hoveredPath)
  }, [hoveredPath, assetsBalances, globalVaultTVL])

  return (
    <TabWrapperStyled className="vaults">
      <div className="top">
        <BGPrimaryTitle>Vaults</BGPrimaryTitle>
        <Link to="/vaults/all">
          <Button text="Vaults" icon="vaults" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>
      {assetsBalances.length ? (
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
                <CommaNumber endingText="%" value={123} />
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
                    {assetsBalances.map(({ symbol, balance, usdValue, rate }) => {
                      return (
                        <TableRow key={symbol} rowHeight={25} borderColor="dataColor" className="add-hover">
                          <TableCell width="33%">{symbol}</TableCell>
                          <TableCell width="33%">
                            <CommaNumber value={balance} useAccurateParsing />
                          </TableCell>
                          <TableCell width="33%" contentPosition="right">
                            <CommaNumber value={usdValue} endingText={rate ? '$' : symbol} useAccurateParsing />
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
                {assetsBalances.map((balanceValue) => (
                  <div
                    style={{
                      background: `linear-gradient(90deg,${
                        chartData.find(
                          ({ title }) => title === balanceValue.symbol || title.includes(balanceValue.symbol),
                        )?.color
                      } 0%,rgba(255,255,255,0) 100%)`,
                    }}
                    className="asset-lable"
                    onMouseEnter={() => {
                      setHoveredPath(balanceValue.symbol)
                    }}
                    onMouseLeave={() => setHoveredPath(null)}
                    key={balanceValue.symbol}
                  >
                    <p className="asset-lable-text">{balanceValue.symbol}</p>
                  </div>
                ))}
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
          The treasury is managed by the Mavryk DAO through on-chain voting. Governance votes, whether for the business
          logic or upgrades to the Mavryk ecosystem, are rewarded with a portion of the earned income from the on-chain
          Treasury <a href="#">Read more</a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}

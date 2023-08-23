import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// utils
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getPieChartData } from 'app/App.components/Chart/helpers/getPieChartData'

// consts
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { VaultsDashboardDataType } from 'providers/VaultsProvider/vaults.provider.types'

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
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { StatBlock, BlockName } from '../Dashboard.style'
import { EmptyContainer, TabWrapperStyled, VaultsContentStyled } from './DashboardTabs.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { convertNumberForClient } from 'utils/calcFunctions'

// TODO: query to group collaterals, will reduce amount of loading data for 90%
export const VaultsTab = ({
  isVaultsDashboardDataLoading,
  vaultsDashboardData,
}: {
  isVaultsDashboardDataLoading: boolean
  vaultsDashboardData: VaultsDashboardDataType
}) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { totalCollateralRatio, averageCollateralRatio, vaultTvl, reducedVaultsCollaterals } = vaultsDashboardData

  const [hoveredPath, setHoveredPath] = useState<null | string>(null)

  const chartData = useMemo(
    () => getPieChartData(reducedVaultsCollaterals, vaultTvl, hoveredPath, tokensMetadata, tokensPrices),
    [hoveredPath, reducedVaultsCollaterals, tokensMetadata, tokensPrices, vaultTvl],
  )

  return (
    <TabWrapperStyled className="vaults">
      <div className="top">
        <BGPrimaryTitle>Vaults</BGPrimaryTitle>
        <Link to="/vaults/all">
          <Button text="Vaults" icon="vaults" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>
      {isVaultsDashboardDataLoading ? (
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
                <CommaNumber value={0} />
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
                        <TableRow key={symbol} rowHeight={25} borderColor="dataColor" className="add-hover">
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

// export const reduceVaultsAssets = (
//   vaultIds: string[],
//   vaultsMapper: Record<string, VaultType>,
//   tokensMetadata: TokensContext['tokensMetadata'],
//   tokensPrices: TokensContext['tokensPrices'],
// ) => {
// let vaultWithBalances = 0
// let totalBorrowedAmounts = 0
// let totalCollateralBalances = 0
// let colorIdx = 0

// const { assets, globalVaultTVL } = vaultIds.reduce<{
//   globalVaultTVL: number
//   collateralRatio: number
//   avgCollateralRatio: number
//   assets: Record<string, VaultAssetData>
// }>(
//   (acc, vaultId) => {
//     const { assets } = acc
//     const { collateralData, borrowedAmount, borrowedTokenAddress } = vaultsMapper[vaultId]

//     const token = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata, tokensPrices })
//     if (!token || !token.rate) return acc
//     const { decimals: borrowedTokenDecimals, rate: borrowedTokenRate } = token

//     const collateralBalance = getVaultCollateralBalance(collateralData, tokensMetadata, tokensPrices)

//     totalBorrowedAmounts +=
//       convertNumberForClient({ number: borrowedAmount, grade: borrowedTokenDecimals }) * borrowedTokenRate
//     totalCollateralBalances += collateralBalance

//     if (borrowedAmount && collateralBalance) {
//       vaultWithBalances++
//     }

//     collateralData.forEach(({ amount, tokenAddress }) => {
//       const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
//       if (!token || !token.rate) return
//       const { decimals: collateralDecimals, rate: collateralRate } = token

//       const convertedAmount = convertNumberForClient({ number: amount, grade: collateralDecimals })

//       acc.globalVaultTVL += convertedAmount * collateralRate

//       if (assets[tokenAddress]) {
//         assets[tokenAddress].balance += amount
//       } else {
//         assets[tokenAddress] = {
//           balance: amount,
//           chartColor: getAssetColor(colorIdx),
//           tokenAddress,
//         }
//         colorIdx++
//       }
//     })

//     return acc
//   },
//   {
//     assets: {},
//     globalVaultTVL: 0,
//     collateralRatio: 0,
//     avgCollateralRatio: 0,
//   },
// )

// const collateralRatio = (totalCollateralBalances / totalBorrowedAmounts) * 100

// return {
//   assetsBalances: Object.values(assets),
//   globalVaultTVL,
//   collateralRatio,
//   avgCollateralRatio: collateralRatio / vaultWithBalances,
// }

//   return {
//     assetsBalances: [],
//     globalVaultTVL: 0,
//     collateralRatio: 0,
//     avgCollateralRatio: 0,
//   }
// }

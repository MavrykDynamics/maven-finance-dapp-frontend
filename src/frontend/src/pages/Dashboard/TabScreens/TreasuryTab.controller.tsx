import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { State } from 'reducers'
import { reduceTreasuryAssets } from 'pages/Treasury/Treasury.helpers'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { emptyContainer } from './LendingTab.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableScrollable,
} from 'app/App.components/Table/Table.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { BlockName, StatBlock } from '../Dashboard.style'
import { TabWrapperStyled, TreasuryContentStyled, TreasuryVesting } from './DashboardTabs.style'

export const TreasuryTab = ({ isLoading }: { isLoading: boolean }) => {
  const { treasuryStorage } = useSelector((state: State) => state.treasury)
  const { totalVestedAmount, totalClaimedAmount } = useSelector((state: State) => state.vesting)

  const amountOfTokens = totalVestedAmount + totalClaimedAmount

  const { assetsBalances, globalTreasuryTVL } = useMemo(() => reduceTreasuryAssets(treasuryStorage), [treasuryStorage])

  const mostAssetsTreasury = useMemo(
    () =>
      treasuryStorage.reduce(
        (acc, treasury) => {
          if (treasury.balances.length > acc.assetsCount) {
            acc.treasuryName = treasury.name
            acc.assetsCount = treasury.balances.length
            acc.treasuryTVL = treasury.treasuryTVL
          }

          return acc
        },
        { treasuryName: '', assetsCount: 0, treasuryTVL: 0 },
      ),
    [treasuryStorage],
  )

  return (
    <TabWrapperStyled backgroundImage="dashboard_treasuryTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Treasury</BGPrimaryTitle>
        <Link to="/treasury">
          <Button text="Treasury" icon="treasury" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>

      {isLoading ? (
        <DataLoaderWrapper className="tabLoader">
          <ClockLoader width={150} height={150} />
          <div className="text">Loading treasury</div>
        </DataLoaderWrapper>
      ) : treasuryStorage.length ? (
        <TreasuryContentStyled>
          <div className="top">
            <StatBlock>
              <div className="name">Global Treasury</div>
              <div className="value">
                <CommaNumber endingText="USD" value={globalTreasuryTVL} />
              </div>
            </StatBlock>
            {mostAssetsTreasury.treasuryName && mostAssetsTreasury.treasuryTVL && (
              <StatBlock>
                <div className="name">{mostAssetsTreasury.treasuryName}</div>
                <div className="value">
                  <CommaNumber endingText="USD" value={mostAssetsTreasury.treasuryTVL} />
                </div>
              </StatBlock>
            )}
          </div>
          <div className="container">
            <div>
              <BlockName>Treasury Assets</BlockName>

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
                            {parseFloat(String(balance)) < 0.01 ? (
                              '<0.01'
                            ) : (
                              <CommaNumber value={balance} useAccurateParsing showDecimal decimalsToShow={2} />
                            )}
                          </TableCell>
                          <TableCell width="33%" contentPosition="right">
                            {parseFloat(String(usdValue)) < 0.01 ? (
                              `<0.01 ${rate ? '$' : symbol}`
                            ) : (
                              <CommaNumber
                                value={usdValue}
                                endingText={rate ? '' : symbol}
                                beginningText={rate ? '$' : ''}
                                useAccurateParsing
                                showDecimal
                                decimalsToShow={2}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableScrollable>
            </div>
            {totalClaimedAmount !== 0 && totalVestedAmount !== 0 ? (
              <div>
                <BlockName>Token Vesting</BlockName>

                <TreasuryVesting
                  totalPersent={(totalVestedAmount / amountOfTokens || 0.5) * 100}
                  claimedColor={'navTitleColor'}
                  totalColor={'primaryColor'}
                >
                  <div className="vest-stat">
                    <div className="name">
                      <div className="color claimed" /> Tokens Claimed
                    </div>
                    <div className="value">
                      <CommaNumber value={totalClaimedAmount} endingText="MVK" />
                    </div>
                  </div>

                  <div className="vest-stat">
                    <div className="name">
                      <div className="color total" /> Total Vested
                    </div>
                    <div className="value">
                      <CommaNumber value={totalVestedAmount} endingText="MVK" />
                    </div>
                  </div>

                  <div className="ratio">
                    <div className="claimed">
                      <div className="hoverValue">
                        Claimed tokens persent: {(totalClaimedAmount / amountOfTokens || 0.5) * 100}%
                      </div>
                    </div>
                    <div className="total">
                      <div className="hoverValue">
                        Total vested persent: {(totalVestedAmount / amountOfTokens || 0.5) * 100}%
                      </div>
                    </div>
                  </div>
                </TreasuryVesting>
              </div>
            ) : null}
          </div>
        </TreasuryContentStyled>
      ) : (
        emptyContainer
      )}

      <div className="descr">
        <div className="title">What is the purpose of the Treasury?</div>
        <div className="text">
          The Treasury is managed by Satellites through on-chain voting. The purpose is to store the income earned from
          Mavryk Finance for assigned purposes, such as buying back MVK, investing & holding in on-chain assets, and
          more.{' '}
          <a href="https://mavryk.finance/litepaper#treasury" target="_blank" rel="noreferrer">
            Read more
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}

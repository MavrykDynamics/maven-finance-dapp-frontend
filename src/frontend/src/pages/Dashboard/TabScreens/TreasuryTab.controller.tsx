import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

// consts
import { silverColor } from 'styles'
import { VESTING_STORAGE_DATA_SUB, DEFAULT_VESTING_SUBS } from 'providers/VestingProvider/helpers/vesting.consts'
import { TREASURY_STORAGE_DATA_SUB, DEFAULT_TREASURY_SUBS } from 'providers/TreasuryProvider/helpers/treasury.consts'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

// hooks
import { useTreasuryContext } from 'providers/TreasuryProvider/treasury.provider'
import { useVestingContext } from 'providers/VestingProvider/vesting.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// utils
import { getTreasuryTVL, reduceTreasuryAssets } from 'providers/TreasuryProvider/helpers/treasury.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// components
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableScrollable,
} from 'app/App.components/Table'

// styles
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { BGPrimaryTitle } from 'pages/BreakGlass/BreakGlass.style'
import { BlockName, StatBlock } from '../Dashboard.style'
import { EmptyContainer, TabWrapperStyled, TreasuryContentStyled, TreasuryVesting } from './DashboardTabs.style'

export const TreasuryTab = () => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    totalVestedAmount,
    totalClaimedAmount,
    changeVestingSubscriptionsList,
    isLoading: isVestingLoading,
  } = useVestingContext()
  const {
    treasuryAddresses,
    treasuryMapper,
    changeTreasurySubscriptionsList,
    isLoading: isTreasuryLoading,
  } = useTreasuryContext()

  useEffect(() => {
    changeTreasurySubscriptionsList({
      [TREASURY_STORAGE_DATA_SUB]: true,
    })

    changeVestingSubscriptionsList({
      [VESTING_STORAGE_DATA_SUB]: true,
    })

    return () => {
      changeTreasurySubscriptionsList(DEFAULT_TREASURY_SUBS)
      changeVestingSubscriptionsList(DEFAULT_VESTING_SUBS)
    }
  }, [])

  const amountOfTokens = totalVestedAmount + totalClaimedAmount

  const treasuryTokens = useMemo(
    () => Object.values(reduceTreasuryAssets(treasuryAddresses, treasuryMapper)),
    [treasuryAddresses, treasuryMapper],
  )

  const { mostSuppliedTreasuryName, mostSuppliedTreasuryTVL, globalTreasuryTVL } = useMemo(
    () =>
      treasuryAddresses.reduce(
        (acc, address) => {
          const treasury = treasuryMapper[address]
          const treasuryTVL = getTreasuryTVL(treasury, tokensMetadata, tokensPrices)

          if (treasuryTVL > acc.mostSuppliedTreasuryTVL) {
            acc.mostSuppliedTreasuryName = treasury.name
            acc.mostSuppliedTreasuryTVL = treasuryTVL
          }

          acc.globalTreasuryTVL += treasuryTVL

          return acc
        },
        { mostSuppliedTreasuryName: '', globalTreasuryTVL: 0, mostSuppliedTreasuryTVL: 0 },
      ),
    [tokensMetadata, tokensPrices, treasuryAddresses, treasuryMapper],
  )

  return (
    <TabWrapperStyled backgroundImage="dashboard_treasuryTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Treasury</BGPrimaryTitle>
        <Link to="/treasury">
          <Button text="Treasury" icon="treasury" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
        </Link>
      </div>

      {isVestingLoading || isTreasuryLoading ? (
        <DataLoaderWrapper className="tabLoader">
          <ClockLoader width={150} height={150} />
          <div className="text">Loading treasury</div>
        </DataLoaderWrapper>
      ) : treasuryAddresses.length ? (
        <TreasuryContentStyled>
          <div className="top">
            <StatBlock>
              <div className="name">Global Treasury</div>
              <div className="value">
                <CommaNumber endingText="USD" value={globalTreasuryTVL} />
              </div>
            </StatBlock>
            {mostSuppliedTreasuryName && mostSuppliedTreasuryTVL && (
              <StatBlock>
                <div className="name">{mostSuppliedTreasuryName}</div>
                <div className="value">
                  <CommaNumber endingText="USD" value={mostSuppliedTreasuryTVL} />
                </div>
              </StatBlock>
            )}
          </div>
          <div className="container">
            <div>
              <BlockName>
                Treasury Assets
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={silverColor}
                  text="Only tokens whitelisted by the DAO are shown in the treasuries. This is because the DAO can only interact with whitelisted tokens."
                />
              </BlockName>

              <TableScrollable bodyHeight={120} className="treasury-table scroll-block">
                <Table>
                  <TableHeader className="treasury">
                    <TableRow>
                      <TableHeaderCell>Asset</TableHeaderCell>
                      <TableHeaderCell>Amount</TableHeaderCell>
                      <TableHeaderCell contentPosition="right">USD Value</TableHeaderCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="treasury">
                    {treasuryTokens.map(({ tokenAddress, balance }) => {
                      const treasuryToken = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
                      if (!treasuryToken || !treasuryToken.rate) return null

                      const { symbol, decimals, rate } = treasuryToken
                      const treasuryTokenBalance = convertNumberForClient({ number: balance, grade: decimals })

                      return (
                        <TableRow key={symbol} rowHeight={25} borderColor="dataColor" className="add-hover">
                          <TableCell width="33%">{symbol}</TableCell>
                          <TableCell width="33%">
                            {treasuryTokenBalance < 0.01 ? (
                              '<0.01'
                            ) : (
                              <CommaNumber value={treasuryTokenBalance} showDecimal decimalsToShow={2} />
                            )}
                          </TableCell>
                          <TableCell width="33%" contentPosition="right">
                            {treasuryTokenBalance * rate < 0.01 ? (
                              `<0.01 ${rate ? '$' : symbol}`
                            ) : (
                              <CommaNumber
                                value={treasuryTokenBalance * rate}
                                endingText={rate ? '' : symbol}
                                beginningText={rate ? '$' : ''}
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
        <EmptyContainer>
          <img src="/images/not-found.svg" alt=" No treasury assets to show" />
          <figcaption> No treasury assets to show</figcaption>
        </EmptyContainer>
      )}

      <div className="descr">
        <div className="title">What is the purpose of the Treasury?</div>
        <div className="text">
          The Treasury is managed by Satellites through on-chain voting. The purpose is to store the income earned from
          Mavryk Finance for assigned purposes, such as buying back MVK, investing & holding in on-chain assets, and
          more.{' '}
          <a href="https://mavryk.finance/litepaper#treasury" target="_blank" rel="noreferrer">
            Read More
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}

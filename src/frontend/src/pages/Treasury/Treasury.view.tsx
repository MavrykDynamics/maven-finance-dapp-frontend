import { useState, useMemo, useEffect, useRef } from 'react'

// view
import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'
import Icon from 'app/App.components/Icon/Icon.view'
import PieChartView from '../../app/App.components/PieСhart/PieСhart.view'

// helpers
import { scrollToFullView } from 'utils/scrollToFullView'

// style
import { TreasuryViewStyle } from './Treasury.style'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'
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
import { Plug } from 'app/App.components/Chart/Chart.style'
import { silverColor } from 'styles'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getTreasuryTVL } from './helpers/treasury.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getPieChartData } from 'app/App.components/Chart/helpers/getPieChartData'

type Props = {
  treasury: TreasuryType[number]
  isGlobal?: boolean
  factoryAddress?: string | null
}

export default function TreasuryView({ treasury, isGlobal = false, factoryAddress }: Props) {
  const [hoveredPath, setHoveredPath] = useState<null | string>(null)
  const [showZeroTreasuries, setShowZeroTreasuries] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const { tokensMetadata, tokensPrices } = useTokensContext()

  const filteredBalance = useMemo(
    () =>
      isGlobal || !showZeroTreasuries ? treasury.balances : treasury.balances.filter((item) => item.balance > 0.01),
    [isGlobal, showZeroTreasuries, treasury.balances],
  )

  const treasuryTVL = useMemo(
    () => getTreasuryTVL(treasury, tokensMetadata, tokensPrices),
    [treasury, tokensMetadata, tokensPrices],
  )

  const chartData = useMemo(
    () => getPieChartData(filteredBalance, treasuryTVL, hoveredPath, tokensMetadata, tokensPrices),
    [hoveredPath, treasuryTVL, filteredBalance, tokensMetadata, tokensPrices],
  )

  useEffect(() => {
    if (treasury) {
      scrollToFullView(ref.current)
    }
  }, [treasury])

  return (
    <TreasuryViewStyle ref={ref}>
      <a
        href="https://mavryk.finance/litepaper#treasury "
        target="_blank"
        rel="noreferrer"
        className="treasuryTooltip-link"
      >
        <CustomTooltip iconId="question" className="treasuryTooltip" />
      </a>

      <div className="content-wrapper">
        <header>
          <h1 title={treasury.name}>{treasury.name}</h1>
        </header>

        <div>
          <div className="info-block">
            <p className="text">
              TVL
              <CustomTooltip
                iconId="info"
                defaultStrokeColor={silverColor}
                text="Only tokens whitelisted by the DAO are shown in the treasuries. This is because the DAO can only interact with whitelisted tokens."
              />
            </p>
            <p className="value">
              <CommaNumber beginningText="$" value={treasuryTVL} />
            </p>
            <div />
          </div>

          {!isGlobal && treasury.balances.length ? (
            <>
              <Checkbox
                id={'treasury-zero-filter'}
                onChangeHandler={() => setShowZeroTreasuries(!showZeroTreasuries)}
                checked={showZeroTreasuries}
                className={'treasury-checkbox'}
              >
                <span>Hide assets with a balance of 0</span>
              </Checkbox>
            </>
          ) : null}

          <TableScrollable bodyHeight={filteredBalance.length === 0 ? 60 : 120} className="treasury-table scroll-block">
            <Table>
              <TableHeader className="treasury">
                <TableRow>
                  <TableHeaderCell>Asset</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell contentPosition="right">USD Value</TableHeaderCell>
                </TableRow>
              </TableHeader>

              {filteredBalance.length ? (
                <TableBody className={`treasury`}>
                  {filteredBalance.map(({ balance, tokenAddress }) => {
                    const treasuryToken = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
                    if (!treasuryToken || !treasuryToken.rate) return null
                    const { symbol, decimals, rate } = treasuryToken
                    const treasuryTokenBalance = convertNumberForClient({ number: balance, grade: decimals })

                    return (
                      <TableRow rowHeight={25} borderColor="dataColor" className="add-hover" key={symbol}>
                        <TableCell width="37%">{symbol}</TableCell>
                        <TableCell width="31%">
                          {treasuryTokenBalance < 0.01 ? (
                            '<0.01'
                          ) : (
                            <CommaNumber value={treasuryTokenBalance} showDecimal />
                          )}
                        </TableCell>
                        <TableCell width="32%" contentPosition="right">
                          {treasuryTokenBalance * rate < 0.01 ? (
                            `<0.01 ${rate ? '$' : symbol}`
                          ) : (
                            <CommaNumber
                              value={treasuryTokenBalance * rate}
                              endingText={rate ? '' : symbol}
                              beginningText={rate ? '$' : ''}
                              showDecimal
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              ) : null}
            </Table>
          </TableScrollable>

          {filteredBalance.length === 0 ? (
            <Plug className={'no-treasury-table-data'}>
              <div>
                <Icon id="stars" className="icon-stars" />
                <Icon id="cow" className="icon-cow" />
              </div>

              <p>No whitelisted assets in treasury</p>
            </Plug>
          ) : null}
        </div>
      </div>
      <div className="pie-chart">
        <PieChartView chartData={chartData} />
      </div>
      <div>
        <div className="asset-lables scroll-block">
          {filteredBalance.map(({ tokenAddress }) => {
            const treasuryToken = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
            if (!treasuryToken) return null
            const { symbol } = treasuryToken

            return (
              <div
                style={{
                  background: `linear-gradient(90deg,${
                    chartData.find(({ title }) => title === symbol || title.split(',').includes(symbol))?.color
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
      {(factoryAddress && isGlobal) || treasury.address ? (
        <div className="address-block">
          <div className="text">Treasury{isGlobal ? ' Factory ' : ' '}Address</div>
          <div className="value">
            <TzAddress type={BLUE} tzAddress={isGlobal ? factoryAddress : treasury.address} hasIcon />
          </div>
        </div>
      ) : null}
    </TreasuryViewStyle>
  )
}

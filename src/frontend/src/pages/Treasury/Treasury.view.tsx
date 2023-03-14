import { useState, useMemo, useEffect, useRef } from 'react'

// view
import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'
import Icon from 'app/App.components/Icon/Icon.view'
import PieChartView from '../../app/App.components/PieСhart/PieСhart.view'

// helpers
import { scrollToFullView } from 'utils/scrollToFullView'

// style
import { TreasuryViewStyle, TzAddress } from './Treasury.style'
import { getPieChartData } from './helpers/calculateChartData'
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
} from 'app/App.components/Table/Table.style'
import { Plug } from 'app/App.components/Chart/Chart.style'

type Props = {
  treasury: TreasuryType
  isGlobal?: boolean
  factoryAddress?: string
}

export default function TreasuryView({ treasury, isGlobal = false, factoryAddress = '' }: Props) {
  const [hoveredPath, setHoveredPath] = useState<null | string>(null)
  const [showZeroTreasuries, setShowZeroTreasuries] = useState<Boolean>(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const filteredBalance = useMemo(
    () =>
      isGlobal || !showZeroTreasuries
        ? treasury.balances
        : treasury.balances.filter((item) => parseFloat(String(item.balance)) > 0.01),
    [isGlobal, showZeroTreasuries, treasury.balances],
  )

  const chartData = useMemo(
    () => getPieChartData(filteredBalance, treasury.treasuryTVL, hoveredPath),
    [hoveredPath, treasury.treasuryTVL, filteredBalance],
  )

  useEffect(() => {
    if (treasury) {
      scrollToFullView(ref.current)
    }
  }, [treasury])

  return (
    <TreasuryViewStyle ref={ref}>
      <a href="https://mavryk.finance" target="_blank" rel="noreferrer" className="treasuryTooltip-link">
        <CustomTooltip iconId="question" className="treasuryTooltip" />
      </a>

      <div className="content-wrapper">
        <header>{treasury.name ? <h1 title={treasury.name}>{treasury.name}</h1> : null}</header>

        <div>
          <div className="info-block">
            <p className="text">TVL</p>
            <p className="value">
              <CommaNumber beginningText="$" value={treasury.treasuryTVL} />
            </p>
            <div />
          </div>

          {!isGlobal && treasury.balances.length ? (
            <>
              <Checkbox
                id={'show_dropped'}
                onChangeHandler={() => {
                  setShowZeroTreasuries(!showZeroTreasuries)
                }}
                checked={showZeroTreasuries}
                className={'treasury-checkbox'}
              >
                <span>Hide assets with a balance of 0</span>
              </Checkbox>
            </>
          ) : null}

          <TableScrollable bodyHeight={filteredBalance.length === 0 ? 60 : 90} className="treasury-table scroll-block">
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
                  {filteredBalance.map(({ symbol, balance, usdValue, rate }) => {
                    return (
                      <TableRow rowHeight={25} borderColor="dataColor" className="add-hover" key={symbol}>
                        <TableCell width="33%">{symbol}</TableCell>
                        <TableCell width="33%">
                          {parseFloat(String(balance)) < 0.01 ? '<0.01' : <CommaNumber value={balance} showDecimal />}
                        </TableCell>
                        <TableCell width="33%" contentPosition="right">
                          {parseFloat(String(usdValue)) < 0.01 ? (
                            `<0.01 ${rate ? '$' : symbol}`
                          ) : (
                            <CommaNumber
                              value={usdValue}
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

              <p>There is not enough data to display the chart</p>
            </Plug>
          ) : null}
        </div>
      </div>
      <div className="pie-chart">
        <PieChartView chartData={chartData} />
      </div>
      <div>
        <div className="asset-lables scroll-block">
          {filteredBalance.map((balanceValue) => (
            <div
              style={{
                background: `linear-gradient(90deg,${
                  chartData.find(({ title }) => title === balanceValue.symbol || title.includes(balanceValue.symbol))
                    ?.color
                } 0%,rgba(255,255,255,0) 100%)`,
              }}
              className="asset-lable"
              onMouseEnter={() => {
                setHoveredPath(balanceValue.symbol)
              }}
              onMouseLeave={() => setHoveredPath(null)}
              key={balanceValue.contract + balanceValue.symbol}
            >
              <p className="asset-lable-text">{balanceValue.symbol}</p>
            </div>
          ))}
        </div>
      </div>
      {factoryAddress || (!isGlobal && treasury.address) ? (
        <div className="address-block">
          <div className="text">Treasury Factory Address</div>
          <div className="value">
            <TzAddress type={BLUE} tzAddress={isGlobal ? factoryAddress : treasury.address} hasIcon={true} />
          </div>
        </div>
      ) : null}
    </TreasuryViewStyle>
  )
}

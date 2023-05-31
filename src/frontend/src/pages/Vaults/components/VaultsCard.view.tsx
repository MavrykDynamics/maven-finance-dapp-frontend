import { useEffect, useState, useContext } from 'react'
import { useSelector } from 'react-redux'

// components
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BorrowingExpandCard } from 'pages/Loans/Components/BorrowindExpandCard'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// styles
import { VaultsCardDropDown } from './../Vaults.style'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'

// types
import { State } from 'reducers'
import {
  STATUS_FLAG_DOWN,
  STATUS_FLAG_INFO,
  STATUS_FLAG_UP,
  STATUS_FLAG_WAITING,
  STATUS_FLAG_WARNING,
  StatusFlagKind,
} from '../../../app/App.components/StatusFlag/StatusFlag.constants'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'

// helpers
import { CYAN } from 'app/App.components/TzAddress/TzAddress.constants'
import { vaultsStatuses } from '../Vaults.consts'
import { loansPopupsContext } from 'pages/Loans/Components/Modals/LoansModals.provider'
import { calculateCollateralShare } from '../calcFunctionsForVault'
import getTimestampByLevel from 'utils/api/getTimestampByLevel'
import { vaultTabs } from '../Vaults.view'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import { Button } from 'app/App.components/Button/Button.controller'

const findStatusInfo = (
  status: string,
): {
  color: StatusFlagKind
  text: string
} => {
  switch (status) {
    case vaultsStatuses.LIQUIDATABLE:
      return { color: STATUS_FLAG_DOWN, text: 'Liquidation Armed' }
    case vaultsStatuses.GRACE_PERIOD:
      return { color: STATUS_FLAG_WARNING, text: 'Grace Period' }
    case vaultsStatuses.MARK:
      return { color: STATUS_FLAG_WARNING, text: 'Ready to Arm' }
    case vaultsStatuses.AT_RISK:
      return { color: STATUS_FLAG_WAITING, text: 'At Risk' }
    case vaultsStatuses.ACTIVE:
      return { color: STATUS_FLAG_UP, text: 'Low Risk' }

    default:
      return { color: STATUS_FLAG_INFO, text: 'no data' }
  }
}

const findFooterText = (status: string, statusColor: StatusFlagKind, timestamp?: number) => {
  const timer = timestamp ? (
    <div className="timer">
      <Timer timestamp={timestamp} options={{ defaultColor: '#77A4F2', negativeColor: '#77A4F2' }} />
    </div>
  ) : (
    <span className="timer">no data</span>
  )

  switch (status) {
    case vaultsStatuses.LIQUIDATABLE:
      return (
        <p>
          This vault is <span className={statusColor}>armed for liquidation</span> and can be liquidated for the next{' '}
          {timer}
        </p>
      )
    case vaultsStatuses.GRACE_PERIOD:
      return (
        <p>
          This vault is in a <span className={statusColor}>grace period</span>. The vault owner has {timer} before
          liquidation is possible.
        </p>
      )
    case vaultsStatuses.MARK:
      return (
        <p>
          This vault is <span className={statusColor}>ready to arm</span> and can be marked for liquidation.
        </p>
      )

    default:
      return ''
  }
}

type Props = LoansVaultType & {
  isOwner: boolean
  handleMarkForLiquidation: (vaultId: number, vaultOwner: string) => void
  vaultTab: string
}

export const VaultsCard = (props: Props) => {
  const {
    ownerId,
    vaultId,
    status,
    levelOfEarly,
    levelOfLate,
    collateralData,
    isOwner,
    liquidationMax,
    liquidationPrice,
    handleMarkForLiquidation,
    vaultTab,
  } = props

  const { isActionActive } = useSelector((state: State) => state.loading)
  const { DAOFee } = useSelector((state: State) => state.loans.config)

  const { openLiquidateVaultPopup } = useContext(loansPopupsContext)

  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const { color: statusColor, text: statusText } = findStatusInfo(status)
  const footerText = findFooterText(status, statusColor, timerTimestamp)

  const collateralTotalBalance = collateralData[collateralData.length - 1]?.amount

  const isActiveFooter =
    status === vaultsStatuses.LIQUIDATABLE || status === vaultsStatuses.GRACE_PERIOD || status === vaultsStatuses.MARK

  const isMarkStatus = vaultsStatuses.MARK === status

  const getCountdownTimestamp = async (levelOfEarly: number, levelOfLate: number) => {
    const [timestampOfEarly, timestampOfLate] = await Promise.all([
      getTimestampByLevel(levelOfEarly),
      getTimestampByLevel(levelOfLate),
    ])

    return {
      timestampOfEarly,
      timestampOfLate,
    }
  }

  const liquidateModalHandler = () => {
    openLiquidateVaultPopup({ ...props })
  }

  useEffect(() => {
    if (status === vaultsStatuses.GRACE_PERIOD || status === vaultsStatuses.LIQUIDATABLE) {
      ;(async () => {
        if (!levelOfEarly || !levelOfLate) {
          setTimerTimestamp(undefined)
          return
        }

        const response = await getCountdownTimestamp(levelOfEarly, levelOfLate)
        const timestamp =
          new Date(response.timestampOfEarly).getTime() -
          new Date(response.timestampOfLate).getTime() +
          new Date().getTime()

        setTimerTimestamp(timestamp)
      })()
    }
  }, [status, levelOfEarly, levelOfLate])

  const headerSufix = <StatusFlag status={statusColor} text={status} className="sufix" />

  const generalExpand = (
    <VaultsCardDropDown>
      <div className="body">
        <div className="left-part">
          <h1>Vault Overview</h1>

          <div className="group">
            <div>
              Vault Owner
              <TzAddress type={CYAN} tzAddress={ownerId} />
            </div>
            <div>
              <div className="title">
                Vault Risk
                <CustomTooltip
                  text="The level of risk of being liquidated your vault is at."
                  iconId="info"
                  className="info-icon"
                />
              </div>

              <div className={statusColor}>{statusText}</div>
            </div>
          </div>

          <div className="group">
            <div>
              <div className="title">
                Liquidation Price
                <CustomTooltip
                  text="Price value of your vault’s collateral at which your vault can be liquidated."
                  iconId="info"
                  className="info-icon"
                />
              </div>

              <CommaNumber value={liquidationPrice ?? 0} decimalsToShow={2} beginningText="$" className="value" />
            </div>

            <div>
              <div className="title">
                Liquidation Cost
                <CustomTooltip
                  text="How much it will cost to liquidated this vault."
                  iconId="info"
                  className="info-icon"
                />
              </div>

              <CommaNumber value={liquidationMax} decimalsToShow={2} beginningText="$" className="value" />
            </div>
          </div>
        </div>

        <div className="right-part">
          <h1>Vault Assets</h1>

          <div className="table-size">
            <Table className={`no-margin borrowing-table ${isOwner ? 'show-before' : ''}`}>
              <TableHeader className={`simple-header collateral ${collateralData.length === 0 ? 'empty' : ''}`}>
                <TableRow>
                  <TableHeaderCell>Asset</TableHeaderCell>
                  <TableHeaderCell>Balance</TableHeaderCell>
                  <TableHeaderCell>Collateral %</TableHeaderCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {collateralData.map(({ symbol, icon, rate, amount }, index) => {
                  const columnWidth = '33%'
                  const isTotalRow = collateralData.length - 1 === index

                  const collateralShare = isTotalRow
                    ? 100
                    : calculateCollateralShare(amount * rate, collateralTotalBalance)

                  if (isTotalRow && collateralData.length < 3) return null

                  return (
                    <TableRow rowHeight={44} key={symbol + '-' + index}>
                      <TableCell width={columnWidth} className="vert-middle">
                        {isTotalRow ? (
                          'Total'
                        ) : (
                          <div className="cell-content row">
                            {icon ? (
                              <div className="img-wrapper">
                                <img src={icon} alt={`${symbol} logo`} />
                              </div>
                            ) : (
                              <div className="no-icon">
                                <Icon id="noImage" />
                              </div>
                            )}
                            {symbol}
                          </div>
                        )}
                      </TableCell>

                      <TableCell width={columnWidth}>
                        <div className="cell-content">
                          <CommaNumber
                            value={amount}
                            decimalsToShow={isTotalRow ? 2 : assetDecimalsToShow}
                            beginningText={isTotalRow ? '$' : ''}
                            className="balance"
                          />
                          {rate ? (
                            <CommaNumber value={amount * rate} decimalsToShow={2} beginningText="~$" className="rate" />
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell width={columnWidth}>
                        <CommaNumber value={isTotalRow ? 100 : collateralShare} decimalsToShow={2} endingText="%" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {footerText && isActiveFooter && (
        <div className="footer">
          {footerText}

          <Button
            text={isMarkStatus ? 'Mark for Liquidation' : 'Liquidate Vault'}
            kind={ACTION_PRIMARY}
            onClick={() => {
              return isMarkStatus ? handleMarkForLiquidation(vaultId, ownerId) : liquidateModalHandler()
            }}
            disabled={vaultsStatuses.GRACE_PERIOD === status || isActionActive}
          />
        </div>
      )}
    </VaultsCardDropDown>
  )

  return (
    <>
      {(vaultTab === vaultTabs.ALL || vaultTab === vaultTabs.MY) && (
        <BorrowingExpandCard {...props} headerSufix={headerSufix} DAOFee={DAOFee} isOwner={isOwner}>
          {!isOwner && generalExpand}
        </BorrowingExpandCard>
      )}

      {vaultTab === vaultTabs.PERMISSIONED && (
        <BorrowingExpandCard {...props} headerSufix={headerSufix} DAOFee={DAOFee} />
      )}
    </>
  )
}

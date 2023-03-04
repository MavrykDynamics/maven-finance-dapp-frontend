import React, { useEffect, useState, useContext } from 'react'

// components
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Button } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BorrowingExpandCard } from 'pages/Loans/Components/BorrowindExpandCard'
import { Timer } from 'app/App.components/Timer/Timer.controller'

// styles
import { VaultsCardDropDown } from './../Vaults.style'
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from 'app/App.components/Table/Table.style'

// types
import { VaultType } from 'utils/TypesAndInterfaces/Vaults'
import { StatusFlagStyle } from '../../../app/App.components/StatusFlag/StatusFlag.constants'
import { BorrowingCardOptions } from 'pages/Loans/Components/BorrowindExpandCard'

// helpers
import { CYAN } from 'app/App.components/TzAddress/TzAddress.constants'
import { vaultsStatuses } from '../Vaults.consts'
import { getTimestampByLevel } from 'pages/Governance/Governance.actions'
import { loansPopupsContext } from 'pages/Loans/Components/Modals/LoansModals.provider'
import { calculateCollateralShare } from '../calcFunctionsForVault'

const findStatusInfo = (status: string) => {
  switch (status) {
    case vaultsStatuses.LIQUIDATABLE:
      return { color: 'down', text: 'Liquidation Armed' }
    case vaultsStatuses.GRACE_PERIOD:
      return { color: 'darkWarning', text: 'Grace Period' }
    case vaultsStatuses.MARK:
      return { color: 'warning', text: 'Ready to Arm' }
    case vaultsStatuses.AT_RISK:
      return { color: 'waiting', text: 'At Risk' }
    case vaultsStatuses.ACTIVE:
      return { color: 'up', text: 'Low Risk' }

    default:
      return { color: 'info', text: 'no data' }
  }
}

const findFooterText = (status: string, statusColor: StatusFlagStyle, timestamp?: number) => {
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

const borrowingCardOptions: BorrowingCardOptions = {
  reverseColumns: true,
}

type Props = VaultType & {
  isOwner: boolean
  handleMarkForLiquidation: (vaultId: number, vaultOwner: string) => void
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
  } = props

  const { openLiquidateVaultPopup } = useContext(loansPopupsContext)
  const [expanded, setExpanded] = useState(false)
  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const statusColor = findStatusInfo(status).color as StatusFlagStyle
  const statusText = findStatusInfo(status).text
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
    if (!expanded) return

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
  }, [status, expanded, levelOfEarly, levelOfLate])

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
                <Icon id="info" className="info-icon" />
              </div>

              <div className={statusColor}>{statusText}</div>
            </div>
          </div>

          <div className="group">
            <div>
              <div className="title">
                Liquidation Price
                <Icon id="info" className="info-icon" />
              </div>

              <CommaNumber value={liquidationPrice ?? 0} decimalsToShow={2} beginningText="$" className="value" />
            </div>

            <div>
              <div className="title">
                Liquidation Cost
                <Icon id="info" className="info-icon" />
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
                            decimalsToShow={2}
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
            disabled={vaultsStatuses.GRACE_PERIOD === status}
          />
        </div>
      )}
    </VaultsCardDropDown>
  )

  return (
    <>
      {isOwner ? (
        <BorrowingExpandCard
          {...props}
          className={`expand-vault ${expanded ? 'openVault' : ''}`}
          headerSufix={headerSufix}
          getExpandedStatus={setExpanded}
          isOwner
          options={borrowingCardOptions}
          // TODO: add this values as on loans
          DAOFee={0}
        />
      ) : (
        <BorrowingExpandCard
          {...props}
          className={`expand-vault ${expanded ? 'openVault' : ''}`}
          headerSufix={headerSufix}
          getExpandedStatus={setExpanded}
          options={borrowingCardOptions}
          // TODO: add this values as on loans
          DAOFee={0}
        >
          {generalExpand}
        </BorrowingExpandCard>
      )}
    </>
  )
}

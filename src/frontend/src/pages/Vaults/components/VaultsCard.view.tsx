import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

// components
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BorrowingExpandCard } from 'pages/Loans/Components/BorrowingExpandCard/BorrowingExpandCard'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { OldBorrowingExpandCard } from 'pages/Loans/Components/BorrowingExpandCard/OldBorrowingExpandCard'
import { vaultTabs } from '../Vaults.view'
import { Button } from 'app/App.components/Button/Button.controller'

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
import { calculateCollateralShare } from '../calcFunctionsForVault'
import { LIQUIDATION_COST, LIQUIDATION_PRICE, VAULT_RISK } from 'texts/tooltips/vault.text'
import { getStringWithoutUnderline } from 'utils/parse'
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
} from 'utils/api/api-helpers/getTimestampByLevel'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import { isAbortError } from 'errors/error'
import { api } from 'utils/api/api'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getVaultStatus } from 'providers/LoansProvider/helpers/vaults.utils'

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

type Props = {
  vault: LoansVaultType
  isOwner: boolean
  handleMarkForLiquidation: (vaultId: number, vaultOwner: string) => void
  vaultTab: string
}

export const VaultsCard = ({ vault, isOwner, handleMarkForLiquidation, vaultTab }: Props) => {
  const { ownerId, vaultId, levelOfEarly, levelOfLate, collateralData, liquidationMax, liquidationPrice } = vault

  const status = getVaultStatus()

  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { bug } = useToasterContext()

  const { isActionActive } = useSelector((state: State) => state.loading)
  const { DAOFee } = useSelector((state: State) => state.loans.config)

  const { openLiquidateVaultPopup } = useLoansPopupsContext()

  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const { color: statusColor, text: statusText } = findStatusInfo(status)
  const footerText = findFooterText(status, statusColor, timerTimestamp)

  const collateralTotalBalance = collateralData[collateralData.length - 1]?.amount

  const isActiveFooter =
    status === vaultsStatuses.LIQUIDATABLE || status === vaultsStatuses.GRACE_PERIOD || status === vaultsStatuses.MARK

  const isMarkStatus = vaultsStatuses.MARK === status

  const liquidateModalHandler = () => {
    openLiquidateVaultPopup({ ...props })
  }

  useEffect(() => {
    if (status === vaultsStatuses.GRACE_PERIOD || status === vaultsStatuses.LIQUIDATABLE) {
      if (!levelOfEarly || !levelOfLate) return

      const abortEarlyController = new AbortController()
      const abortLatelyController = new AbortController()

      ;(async () => {
        try {
          const [{ data: timestampOfEarly }, { data: timestampOfLate }] = await Promise.all([
            api(
              getTimestampByLevelUrl(levelOfEarly),
              { signal: abortEarlyController.signal, headers: getTimestampByLevelHeaders },
              getTimestampByLevelSchema,
            ),
            api(
              getTimestampByLevelUrl(levelOfLate),
              { signal: abortLatelyController.signal, headers: getTimestampByLevelHeaders },
              getTimestampByLevelSchema,
            ),
          ])

          const timestamp =
            new Date(timestampOfEarly).getTime() - new Date(timestampOfLate).getTime() + new Date().getTime()

          setTimerTimestamp(timestamp)
        } catch (e) {
          // TODO: handle fetch errors when error boundary will be ready
          if (!isAbortError(e)) {
            console.error('getting timestamp by lvl error: ', e)
          }
          bug('Unexpected error happened occured, please reload the page')
        }
      })()

      return () => {
        abortEarlyController.abort()
        abortLatelyController.abort()
      }
    }

    return () => null
  }, [status, levelOfEarly, levelOfLate])

  const headerSufix = <StatusFlag status={statusColor} text={getStringWithoutUnderline(status)} className="sufix" />

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
              Vault Risk
              <CustomTooltip text={VAULT_RISK} iconId="info" className="tooltip" />
              <div className={statusColor}>{statusText}</div>
            </div>
          </div>

          <div className="group">
            <div>
              Liquidation Price
              <CustomTooltip iconId="info" text={LIQUIDATION_PRICE} className="tooltip" />
              <CommaNumber value={liquidationPrice ?? 0} decimalsToShow={2} beginningText="$" className="value" />
            </div>

            <div>
              Liquidation Cost
              <CustomTooltip text={LIQUIDATION_COST} iconId="info" className="tooltip" />
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
                {collateralData.map(({ tokenAddress, amount }, index) => {
                  const columnWidth = '33%'
                  const isTotalRow = collateralData.length - 1 === index

                  if (isTotalRow && collateralData.length < 3) return null

                  const { symbol, icon } = tokensMetadata[tokenAddress]
                  const rate = tokensPrices[symbol]

                  const collateralShare = isTotalRow
                    ? 100
                    : calculateCollateralShare(amount * rate, collateralTotalBalance)

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

  switch (vaultTab) {
    case vaultTabs.MY:
      return (
        <BorrowingExpandCard
          vault={vault}
          headerSufix={headerSufix}
          DAOFee={DAOFee}
          isOwner={isOwner}
          hideTransactionHistory
        />
      )

    case vaultTabs.PERMISSIONED:
      return (
        // TODO: use old component, because need old view for permission vaults.
        // After all redesign in the future, we will move everything into BorrowingExpandCard component
        <OldBorrowingExpandCard vault={vault} headerSufix={headerSufix} DAOFee={DAOFee} />
      )

    default:
      return (
        <BorrowingExpandCard
          vault={vault}
          headerSufix={headerSufix}
          DAOFee={DAOFee}
          isOwner={isOwner}
          hideTransactionHistory
        >
          {generalExpand}
        </BorrowingExpandCard>
      )
  }
}

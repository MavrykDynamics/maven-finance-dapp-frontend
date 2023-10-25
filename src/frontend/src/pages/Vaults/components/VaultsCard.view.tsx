import { useEffect, useState } from 'react'

// components
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
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
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import colors, { ThemeColorsType } from 'styles/colors'

// types
import {
  STATUS_FLAG_DOWN,
  STATUS_FLAG_INFO,
  STATUS_FLAG_UP,
  STATUS_FLAG_WAITING,
  STATUS_FLAG_WARNING,
  StatusFlagKind,
} from '../../../app/App.components/StatusFlag/StatusFlag.constants'

// helpers
import { SECONDARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import { vaultsStatuses } from '../Vaults.consts'
import { LIQUIDATION_COST, LIQUIDATION_PRICE, VAULT_RISK } from 'texts/tooltips/vault.text'
import { getStringWithoutUnderline } from 'utils/parse'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { VaultType } from 'providers/VaultsProvider/vaults.provider.types'
import { calculateCollateralShare } from 'providers/VaultsProvider/helpers/vaults.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

// hooks
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useFullVault } from 'providers/VaultsProvider/hooks/useFullVault'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import Icon from 'app/App.components/Icon/Icon.view'

const columnWidth = '33%'

const findStatusInfo = (
  status: string
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

const findFooterText = ({
  status,
  statusColor,
  timestamp,
  theme,
}: {
  status: string
  statusColor: StatusFlagKind
  timestamp?: number
  theme: ThemeColorsType
}) => {
  const timer = timestamp ? (
    <div className="timer">
      <Timer timestamp={timestamp} options={{ defaultColor: theme.primaryText, negativeColor: theme.downColor }} />
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
  vault: VaultType
  isOwner: boolean
  handleMarkForLiquidation: (args: { vaultId: number; vaultOwner: string }) => void
  vaultTab: string
}

export const VaultsCard = ({ vault, isOwner, handleMarkForLiquidation, vaultTab }: Props) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { openLiquidateVaultPopup } = useLoansPopupsContext()
  const {
    config: { daoFee },
  } = useLoansContext()
  const {
    globalLoadingState: { isActionActive },
    preferences: { themeSelected },
  } = useDappConfigContext()

  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const vaultData = useFullVault(vault)

  useEffect(() => {
    if (
      vaultData?.liquidationTimestamp &&
      (vaultData.status === vaultsStatuses.GRACE_PERIOD || vaultData.status === vaultsStatuses.LIQUIDATABLE)
    ) {
      setTimerTimestamp(new Date(vaultData?.liquidationTimestamp).getTime())
    }
  }, [vaultData])

  if (!vaultData) return null

  const {
    status,
    vaultId,
    collateralBalance,
    ownerAddress,
    collateralData,
    liquidationMax,
    liquidationReward,
    adminLiquidateFee,
    borrowedTokenAddress,
    liquidationPrice,
  } = vaultData

  const isActiveFooter =
    status === vaultsStatuses.LIQUIDATABLE || status === vaultsStatuses.GRACE_PERIOD || status === vaultsStatuses.MARK

  const isMarkStatus = vaultsStatuses.MARK === status

  const { color: statusColor, text: statusText } = findStatusInfo(status)
  const footerText = findFooterText({ status, statusColor, timestamp: timerTimestamp, theme: colors[themeSelected] })

  const liquidateModalHandler = () => {
    openLiquidateVaultPopup({
      vaultId,
      ownerAddress,
      tokenAddress: borrowedTokenAddress,
      collateralBalance,
      collateralData,
      liquidationMax,
      liquidationReward,
      adminLiquidateFee,
    })
  }

  const headerSufix = <StatusFlag status={statusColor} text={getStringWithoutUnderline(status)} className="sufix" />

  const generalExpand = (
    <VaultsCardDropDown>
      <div className="body">
        <div className="left-part">
          <h1>Vault Overview</h1>

          <div className="group">
            <div>
              Vault Owner
              <TzAddress type={SECONDARY_TZ_ADDRESS_COLOR} tzAddress={ownerAddress} hasIcon />
            </div>
            <div>
              <div className="name">
                Vault Risk
                <Tooltip>
                  <Tooltip.Trigger className="ml-3">
                    <Icon id="info" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>{VAULT_RISK}</Tooltip.Content>
                </Tooltip>
              </div>
              <div className={statusColor}>{statusText}</div>
            </div>
          </div>

          <div className="group">
            <div>
              <div className="name">
                Liquidation Price
                <Tooltip>
                  <Tooltip.Trigger className="ml-3">
                    <Icon id="info" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>{LIQUIDATION_PRICE}</Tooltip.Content>
                </Tooltip>
              </div>
              <CommaNumber value={liquidationPrice ?? 0} decimalsToShow={2} beginningText="$" className="value" />
            </div>

            <div>
              <div className="name">
                Liquidation Cost
                <Tooltip>
                  <Tooltip.Trigger className="ml-3">
                    <Icon id="info" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>{LIQUIDATION_COST}</Tooltip.Content>
                </Tooltip>
              </div>
              <CommaNumber value={liquidationMax} decimalsToShow={2} beginningText="$" className="value" />
            </div>
          </div>
        </div>

        <div className="right-part">
          <h1>Vault Assets</h1>

          <div className="table-size scroll-block">
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
                  const collateralToken = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })

                  if (!collateralToken || !collateralToken.rate) return null

                  const { symbol, icon, rate, decimals } = collateralToken

                  const convertedAmount = convertNumberForClient({ number: amount, grade: decimals })
                  const collateralShare = calculateCollateralShare(convertedAmount * rate, collateralBalance)

                  return (
                    <TableRow rowHeight={44} key={symbol + '-' + index}>
                      <TableCell width={columnWidth} className="vert-middle">
                        <div className="cell-content row collateral-icon">
                          <ImageWithPlug imageLink={icon} alt={`${symbol} logo`} />
                          {symbol}
                        </div>
                      </TableCell>

                      <TableCell width={columnWidth}>
                        <div className="cell-content">
                          <CommaNumber
                            value={convertedAmount}
                            decimalsToShow={assetDecimalsToShow}
                            className="balance"
                          />
                          {rate ? (
                            <CommaNumber
                              value={convertedAmount * rate}
                              decimalsToShow={2}
                              beginningText="~$"
                              className="rate"
                            />
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell width={columnWidth}>
                        <CommaNumber value={collateralShare} decimalsToShow={2} endingText="%" />
                      </TableCell>
                    </TableRow>
                  )
                })}

                {/* Total row */}
                {collateralData.length >= 2 ? (
                  <TableRow rowHeight={44}>
                    <TableCell width={columnWidth} className="vert-middle">
                      Total
                    </TableCell>

                    <TableCell width={columnWidth}>
                      <div className="cell-content">
                        <CommaNumber
                          value={collateralBalance}
                          decimalsToShow={2}
                          beginningText="$"
                          className="balance"
                        />
                      </div>
                    </TableCell>

                    <TableCell width={columnWidth}>
                      <CommaNumber value={100} endingText="%" />
                    </TableCell>
                  </TableRow>
                ) : null}
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
              return isMarkStatus
                ? handleMarkForLiquidation({ vaultId, vaultOwner: ownerAddress })
                : liquidateModalHandler()
            }}
            disabled={vaultsStatuses.GRACE_PERIOD === status || isActionActive}
          />
        </div>
      )}
    </VaultsCardDropDown>
  )

  if (isOwner || vaultTab === vaultTabs.MY) {
    return (
      <BorrowingExpandCard
        vault={vault}
        headerSufix={headerSufix}
        DAOFee={daoFee}
        isOwner={isOwner}
        hideTransactionHistory
      />
    )
  }

  if (vaultTab === vaultTabs.PERMISSIONED) {
    return (
      // TODO: use old component, because need old view for permission vaults.
      // After all redesign in the future, we will move everything into BorrowingExpandCard component
      <OldBorrowingExpandCard vault={vault} headerSufix={headerSufix} />
    )
  }

  return (
    <BorrowingExpandCard
      vault={vault}
      headerSufix={headerSufix}
      DAOFee={daoFee}
      isOwner={isOwner}
      hideTransactionHistory
    >
      {generalExpand}
    </BorrowingExpandCard>
  )
}

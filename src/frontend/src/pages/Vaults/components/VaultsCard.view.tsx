import dayjs from 'dayjs'

// components
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BorrowingExpandCard } from 'pages/Loans/Components/BorrowingExpandCard/BorrowingExpandCard'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { OldBorrowingExpandCard } from 'pages/Loans/Components/BorrowingExpandCard/OldBorrowingExpandCard'
import { vaultTabs } from '../Vaults.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import { Button } from 'app/App.components/Button/Button.controller'
import { DotsLoader } from 'app/App.components/Loader/Loader.view'

// styles
import { VaultsCardDropDown } from './../Vaults.style'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'app/App.components/Table'
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
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

const columnWidth = '33%'

const findStatusInfo = (
  status: string,
): {
  color: StatusFlagKind
  text: string
} => {
  switch (status) {
    case vaultsStatuses.LIQUIDATABLE:
      return { color: STATUS_FLAG_DOWN, text: 'Ready To Liquidate' }
    case vaultsStatuses.GRACE_PERIOD:
      return { color: STATUS_FLAG_WARNING, text: 'Grace Period' }
    case vaultsStatuses.MARK:
      return { color: STATUS_FLAG_WARNING, text: 'Ready to Arm' }
    case vaultsStatuses.AT_RISK:
      return { color: STATUS_FLAG_WAITING, text: 'At Risk' }
    case vaultsStatuses.ACTIVE:
      return { color: STATUS_FLAG_UP, text: 'Low Risk' }

    default:
      return { color: STATUS_FLAG_UP, text: 'Low Risk' }
  }
}

const findStatusTooltipText = (status: string): string => {
  switch (status) {
    case vaultsStatuses.LIQUIDATABLE:
      return 'The vault is now open for anyone to foreclose up to 50% of the debt.'
    case vaultsStatuses.GRACE_PERIOD:
      return 'After this period, the vault will be open to liquidation. This is a last chance for the vault owner to pay off debt or add collateral.'
    case vaultsStatuses.MARK:
      return 'Collateral is below 150%, ready to initiate the grace period prior to liquidation.'
    case vaultsStatuses.AT_RISK:
      return 'Between 150% to 200% Collateral.'
    case vaultsStatuses.ACTIVE:
      return 'Healthy vault above 200% Collateral.'

    default:
      return VAULT_RISK
  }
}

const findFooterText = ({
  status,
  statusColor,
  gracePeriodTimestamp,
  liquidationTimestamp,
  theme,
}: {
  status: string
  statusColor: StatusFlagKind
  gracePeriodTimestamp: number | null
  liquidationTimestamp: number | null
  theme: ThemeColorsType
}) => {
  const timerOptions = { defaultColor: theme.primaryText, negativeColor: theme.downColor }

  const isLiquidationTimerFinished = liquidationTimestamp && dayjs().valueOf() >= dayjs(liquidationTimestamp).valueOf()
  const isGracePeriodTimerFinished = gracePeriodTimestamp && dayjs().valueOf() >= dayjs(gracePeriodTimestamp).valueOf()

  switch (status) {
    case vaultsStatuses.LIQUIDATABLE:
      return (
        <p>
          The grace period has ended and this vault is able to be <span className={statusColor}>liquidated</span>.
        </p>
      )
    case vaultsStatuses.GRACE_PERIOD:
      return isGracePeriodTimerFinished || !gracePeriodTimestamp ? (
        <p>
          This vault is in a <span className={statusColor}>grace period</span>.
        </p>
      ) : (
        <p>
          This vault is in a <span className={statusColor}>grace period</span>. The vault owner must repay debt or add
          collateral, or liquidation will be possible in{' '}
          <div className="timer">
            <Timer timestamp={gracePeriodTimestamp} options={timerOptions} />
          </div>
        </p>
      )
    case vaultsStatuses.MARK:
      return (
        <p>
          This vault is <span className={statusColor}>ready to Mark</span>, which initiates the grace period prior to
          liquidation.
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
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()
  const { openLiquidateVaultPopup } = useLoansPopupsContext()
  const {
    config: { daoFee },
  } = useLoansContext()
  const {
    globalLoadingState: { isActionActive },
    preferences: { themeSelected },
  } = useDappConfigContext()

  const vaultData = useFullVault(vault)

  if (vaultData.vault === null) return null

  const {
    vault: {
      status,
      address: vaultAddress,
      vaultId,
      collateralBalance,
      ownerAddress,
      collateralData,
      borrowedToken,
      totalOutstanding,
      borrowedAmount,
      liquidationMax,
      liquidationRewardCoefficient,
      adminLiquidateFeeCoefficient,
      borrowedTokenAddress,
      gracePeriodTimestamp,
      liquidationTimestamp,
    },
    isStatusLoading,
  } = vaultData

  const { color: statusColor, text: statusText } = findStatusInfo(status ?? '')
  const statusTooltipText = findStatusTooltipText(status ?? '')
  const footerText = findFooterText({
    status: status ?? '',
    statusColor,
    gracePeriodTimestamp,
    liquidationTimestamp,
    theme: colors[themeSelected],
  })

  const isMarkStatus = vaultsStatuses.MARK === status

  const liquidationPrice = totalOutstanding === 0 ? 0 : totalOutstanding * borrowedToken.rate * 1.5

  const isLiquidationFooterActive =
    footerText &&
    (status === vaultsStatuses.LIQUIDATABLE || status === vaultsStatuses.GRACE_PERIOD || status === vaultsStatuses.MARK)

  const liquidateModalHandler = () => {
    if (!userAddress) {
      bug('You need to be logged in to liquidate the vault')
      return
    }

    openLiquidateVaultPopup({
      vaultId,
      vaultAddress,
      userAddress: userAddress,
      ownerAddress,
      tokenAddress: borrowedTokenAddress,
      collateralBalance,
      collateralData,
      liquidationMax,
      liquidationRewardCoefficient,
      adminLiquidateFeeCoefficient,
    })
  }

  const headerSufix = (
    <StatusFlag
      status={statusColor}
      text={getStringWithoutUnderline(status ?? '')}
      className="sufix"
      isLoading={isStatusLoading || status === null}
    />
  )

  // view for owner
  if (isOwner || vaultTab === vaultTabs.MY) {
    return <BorrowingExpandCard vault={vault} headerSuffix={headerSufix} DAOFee={daoFee} isOwner={isOwner} />
  }

  // view for permissioned userd
  if (vaultTab === vaultTabs.PERMISSIONED) {
    return (
      // TODO: use old component, because need old view for permission vaults.
      // After all redesign in the future, we will move everything into BorrowingExpandCard component
      <OldBorrowingExpandCard vault={vault} headerSufix={headerSufix} />
    )
  }

  // view for "guest"
  return (
    <BorrowingExpandCard vault={vault} headerSuffix={headerSufix} DAOFee={daoFee} isOwner={isOwner}>
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
                    <Tooltip.Content>{statusTooltipText}</Tooltip.Content>
                  </Tooltip>
                </div>
                {isStatusLoading ? <DotsLoader /> : <div className={statusColor}>{statusText}</div>}
              </div>
            </div>

            <div className="group">
              <div>
                <div className="name">
                  Collateral Liquidation Point
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
                <CommaNumber
                  value={liquidationMax * borrowedToken.rate}
                  decimalsToShow={2}
                  beginningText="$"
                  className="value"
                />
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
                    const collateralToken = getTokenDataByAddress({
                      tokenAddress,
                      tokensMetadata,
                      tokensPrices,
                    })

                    if (!collateralToken || !collateralToken.rate) return null

                    const { symbol, icon, rate, decimals } = collateralToken

                    const convertedAmount = convertNumberForClient({
                      number: amount,
                      grade: decimals,
                    })
                    const collateralShare = calculateCollateralShare(convertedAmount * rate, collateralBalance)

                    return (
                      <TableRow $rowHeight={44} key={symbol + '-' + index}>
                        <TableCell $width={columnWidth} className="vert-middle">
                          <div className="cell-content row collateral-icon">
                            <ImageWithPlug useRounded imageLink={icon} alt={`${symbol} logo`} />
                            {symbol}
                          </div>
                        </TableCell>

                        <TableCell $width={columnWidth}>
                          <div className="cell-content">
                            <CommaNumber value={convertedAmount} decimalsToShow={2} className="balance" />
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

                        <TableCell $width={columnWidth}>
                          <CommaNumber value={collateralShare} decimalsToShow={2} endingText="%" />
                        </TableCell>
                      </TableRow>
                    )
                  })}

                  {/* Total row */}
                  {collateralData.length >= 2 ? (
                    <TableRow $rowHeight={44}>
                      <TableCell $width={columnWidth} className="vert-middle">
                        Total
                      </TableCell>

                      <TableCell $width={columnWidth}>
                        <div className="cell-content">
                          <CommaNumber
                            value={collateralBalance}
                            decimalsToShow={2}
                            beginningText="$"
                            className="balance"
                          />
                        </div>
                      </TableCell>

                      <TableCell $width={columnWidth}>
                        <CommaNumber value={100} endingText="%" />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {isLiquidationFooterActive ? (
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
        ) : null}
      </VaultsCardDropDown>
    </BorrowingExpandCard>
  )
}

import { useMemo, useRef } from 'react'
import { useClickAway } from 'react-use'
import { useLocation, useNavigate } from 'react-router-dom'
import classNames from 'classnames'

import { assetDecimalsToShow, COLLATERAL_RATIO_GRADIENT, getCollateralRatioPercentColor } from '../../Loans.const'
import { BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'
import colors from 'styles/colors'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import ExpandSimple from 'app/App.components/Expand/ExpandSimple.view'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatusMessage } from '../StatusMessage.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'app/App.components/Table'
import { ThreeLevelListItem } from '../../Loans.style'
import { BorrowingExpandedCard } from '../LoansComponents.style'

import { getCollateralRatioByPercentage } from '../../Loans.helpers'
import { convertNumberForClient } from 'utils/calcFunctions'
import {
  checkWhetherTokenIsCollateralToken,
  getTokenDataByAddress,
  isMVRKAsset,
} from 'providers/TokensProvider/helpers/tokens.utils'
import { VaultType } from 'providers/VaultsProvider/vaults.provider.types'
import { calculateCollateralShare } from 'providers/VaultsProvider/helpers/vaults.utils'

// hooks
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { useFullVault } from 'providers/VaultsProvider/hooks/useFullVault'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

type BorrowingExpandCardPropsType = {
  vault: VaultType
  isOpenedVault?: boolean
  headerSufix?: React.ReactNode
  children?: React.ReactNode
}

export const OldBorrowingExpandCard = ({ headerSufix, children, vault }: BorrowingExpandCardPropsType) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { openAddExistingCollateralPopup, addExistingCollateralPopup } = useLoansPopupsContext()
  const {
    globalLoadingState: { isActionActive },
    preferences: { themeSelected },
  } = useDappConfigContext()

  // TODO: test how it works with only 1 popup
  const notHandleClickAway = addExistingCollateralPopup.showModal || isActionActive

  const ref = useRef<HTMLDivElement | null>(null)
  useClickAway(ref, () => (notHandleClickAway ? null : handleCloseVault()))

  const navigate = useNavigate()
  const location = useLocation()

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const vaultAddress = params.get('vaultAddress')
  const isExpanded = vault.address === vaultAddress

  const { vault: vaultData, isStatusLoading } = useFullVault(vault)

  if (!vaultData) return null

  const {
    collateralData,
    address,
    vaultId,
    borrowedToken,
    name,
    collateralRatio,
    borrowedAmount,
    borrowedTokenAddress,
    accruedInterest,
    totalOutstanding,
    collateralBalance,
    apr,
    borrowCapacity,
    status,
    gracePeriodTimestamp,
  } = vaultData

  const { symbol, decimals, icon, rate } = borrowedToken

  const vaultHasXtzCollateral = collateralData.find(({ tokenAddress }) => isMVRKAsset(tokenAddress))
  const vaultHasSmvnCollateral = collateralData.find(({ tokenAddress }) => tokenAddress === SMVN_TOKEN_ADDRESS)

  const handleOpenVault = () => {
    if (isExpanded) return

    params.append('vaultAddress', address)
    navigate({ ...location, search: params.toString() }, { replace: true })
  }

  const handleCloseVault = () => {
    if (!isExpanded) return

    params.delete('vaultAddress')
    navigate({ ...location, search: params.toString() }, { replace: true })
  }

  const handleClickExpand = () => {
    isExpanded ? handleCloseVault() : handleOpenVault()
  }

  return (
    <div ref={ref}>
      <ExpandSimple
        isExpanded={isExpanded}
        onClick={handleClickExpand}
        openButtonName="View"
        className={classNames('expand-borrow-tab', { 'expanded-card': isExpanded })}
        sufix={headerSufix}
        header={
          <>
            <ThreeLevelListItem className="borrow-asset-header">
              <ImageWithPlug useRounded imageLink={icon} alt={`${symbol} icon`} />
              <div className="data">
                <div className="value">{name ? name : symbol}</div>
                <div className="value">
                  <TzAddress tzAddress={address} shouldCopy hasIcon />
                </div>
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem
              className="collateral-diagram"
              $customColor={getCollateralRatioPercentColor(colors[themeSelected], collateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio: <CommaNumber value={collateralRatio} endingText="%" showDecimal decimalsToShow={2} />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPercentage={getCollateralRatioByPercentage(collateralRatio)}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Outstanding Debt</div>
              <CommaNumber
                value={totalOutstanding * rate}
                beginningText="$"
                className="value"
                showDecimal
                decimalsToShow={decimals}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Collateral amount</div>
              <CommaNumber
                value={collateralBalance}
                className="value"
                beginningText="$"
                showDecimal
                decimalsToShow={2}
              />
            </ThreeLevelListItem>
          </>
        }
      >
        {children || (
          <BorrowingExpandedCard
            className={`expand-borrow-tab-container ${
              vaultHasXtzCollateral || vaultHasSmvnCollateral ? '' : 'more-padding'
            }`}
          >
            {status && (
              <StatusMessage
                status={status}
                gracePeriodTimestamp={gracePeriodTimestamp}
                theme={colors[themeSelected]}
                isLoading={isStatusLoading}
              />
            )}

            <div className="block-name">Borrowed</div>
            <div className="borrowed-data">
              <ThreeLevelListItem>
                <div className="name">Asset</div>
                <div className="value">
                  <ImageWithPlug useRounded imageLink={icon} alt={`${symbol} icon`} />
                  {symbol}
                </div>
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Principal</div>
                <CommaNumber value={borrowedAmount} decimalsToShow={decimals} className="value" />
                <CommaNumber value={borrowedAmount * rate} decimalsToShow={2} beginningText="$" className="rate" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">
                  Accrued Interest
                  <Tooltip>
                    <Tooltip.Trigger className="ml-3">
                      <Icon id="info" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>Interest, compounded over time every time you borrow</Tooltip.Content>
                  </Tooltip>
                </div>
                <CommaNumber value={accruedInterest} decimalsToShow={decimals} className="value" />
                <CommaNumber value={accruedInterest * rate} decimalsToShow={2} beginningText="$" className="rate" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">APR</div>
                <CommaNumber value={apr} decimalsToShow={2} className="value" endingText="%" />
              </ThreeLevelListItem>
            </div>

            {collateralData.length ? (
              <>
                <div className="block-name margin-top">Collateral In Vault</div>
                <Table className={`no-margin borrowing-table`}>
                  {collateralData.length ? (
                    <TableHeader className={`simple-header collateral `}>
                      <TableRow>
                        <TableHeaderCell>Asset</TableHeaderCell>
                        <TableHeaderCell>Amount</TableHeaderCell>
                        <TableHeaderCell>Collateral Share</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                  ) : null}

                  <TableBody>
                    {collateralData.map(({ tokenAddress, amount }, idx) => {
                      const collateralToken = getTokenDataByAddress({
                        tokenAddress,
                        tokensMetadata,
                        tokensPrices,
                      })

                      if (
                        !collateralToken ||
                        !collateralToken.rate ||
                        !checkWhetherTokenIsCollateralToken(collateralToken)
                      )
                        return null

                      const { symbol, icon, rate, decimals } = collateralToken

                      const convertedAmount = convertNumberForClient({
                        number: amount,
                        grade: decimals,
                      })
                      const collateralShare = calculateCollateralShare(convertedAmount * rate, collateralBalance)

                      return (
                        <TableRow $rowHeight={65} key={symbol}>
                          <TableCell $width={'22%'} className="vert-middle">
                            <div className="cell-content row with-icon">
                              <ImageWithPlug useRounded imageLink={icon} alt={`${symbol} icon`} />
                              {symbol}
                            </div>
                          </TableCell>

                          <TableCell $width={'22%'}>
                            <div className="cell-content">
                              <CommaNumber
                                value={convertedAmount}
                                className="value"
                                showDecimal
                                decimalsToShow={assetDecimalsToShow}
                              />
                              <CommaNumber
                                value={convertedAmount * rate}
                                className="borrowedTokenRate"
                                beginningText="$"
                                showDecimal
                              />
                            </div>
                          </TableCell>
                          <TableCell $width={'22%'}>
                            <div className="cell-content">
                              <CommaNumber value={collateralShare} className="value" endingText="%" />
                            </div>
                          </TableCell>
                          <TableCell className={`buttons borrowing single-btn`}>
                            <div className="cell-content row">
                              <Button
                                onClick={() =>
                                  openAddExistingCollateralPopup?.({
                                    vaultAddress: vault.address,
                                    vaultId,
                                    currentTotalOutstanding: totalOutstanding,
                                    collateralBalance,
                                    collateralRatio,
                                    borrowedTokenAddress,
                                    availableLiquidity: vault.availableLiquidity,
                                    borrowCapacity,
                                    collateralTokenAddress: collateralData[idx].tokenAddress,
                                  })
                                }
                                form={BUTTON_WIDE}
                                kind={BUTTON_SECONDARY}
                                disabled={isActionActive || collateralToken.loanData.isPausedCollateral}
                              >
                                <Icon id="plus" /> Add
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}

                    {/* Total row */}
                    {collateralData.length >= 2 ? (
                      <TableRow $rowHeight={44}>
                        <TableCell $width={'22%'} className="vert-middle">
                          Total
                        </TableCell>

                        <TableCell $width={'22%'}>
                          <div className="cell-content">
                            <CommaNumber
                              value={collateralBalance}
                              decimalsToShow={2}
                              beginningText="$"
                              className="balance"
                            />
                          </div>
                        </TableCell>

                        <TableCell $width={'22%'}>
                          <CommaNumber value={100} endingText="%" />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </>
            ) : null}
          </BorrowingExpandedCard>
        )}
      </ExpandSimple>
    </div>
  )
}

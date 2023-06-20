import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useClickAway } from 'react-use'
import { useHistory, useLocation } from 'react-router-dom'
import classNames from 'classnames'

import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent } from '../../Loans.const'
import { BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import colors from 'styles/colors'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import ExpandSimple from 'app/App.components/Expand/ExpandSimple.view'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatusMessage } from '../StatusMessage.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { assetDecimalsToShow } from '../../Loans.const'

import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { ThreeLevelListItem } from '../../Loans.style'
import { BorrowingExpandedCard } from '../LoansComponents.style'

import { State } from 'reducers'
import { calculateCollateralShare } from 'pages/Vaults/calcFunctionsForVault'
import { getCollateralRatioByPersentage } from '../../Loans.helpers'
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { getTokenDataByAddress, isTezosAsset } from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { VaultType } from 'providers/LoansProvider/helpers/vaults.types'
import { useFullVault } from 'providers/LoansProvider/hooks/useFullVault'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'

type BorrowingExpandCardPropsType = {
  vault: VaultType
  isOpenedVault?: boolean
  headerSufix?: React.ReactNode
  children?: React.ReactNode
}

export const OldBorrowingExpandCard = ({ headerSufix, children, vault }: BorrowingExpandCardPropsType) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { openAddExistingCollateralPopup, addExistingCollateralPopup } = useLoansPopupsContext()

  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  // TODO: test how it works with only 1 popup
  const notHandleClickAway = addExistingCollateralPopup.showModal || isActionActive

  const ref = useRef<HTMLDivElement | null>(null)
  useClickAway(ref, () => (notHandleClickAway ? null : handleCloseVault()))

  const history = useHistory()
  const location = useLocation()

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const vaultAddress = params.get('vaultAddress')
  const isExpanded = vault.address === vaultAddress

  const vaultData = useFullVault(vault)

  useEffect(() => {
    if (
      vaultData?.liquidationTimestamp &&
      isExpanded &&
      (vaultData.status === vaultsStatuses.GRACE_PERIOD || vaultData.status === vaultsStatuses.LIQUIDATABLE)
    ) {
      setTimerTimestamp(new Date(vaultData?.liquidationTimestamp).getTime())
    }
  }, [vaultData, isExpanded])

  if (!vaultData) return null

  const {
    collateralData,
    address,
    borrowedToken,
    name,
    collateralRatio,
    borrowedAmount,
    borrowedTokenAddress,
    fee,
    totalOutstanding,
    collateralBalance,
    apr,
    borrowCapacity,
    status,
  } = vaultData

  const { symbol, decimals, icon, rate } = borrowedToken

  const vaultHasXtzCollateral = collateralData.find(({ tokenAddress }) => isTezosAsset(tokenAddress))
  // TODO: find a method to check whether it's smvk collateral
  const vaultHasSmvkCollateral = collateralData.find(({ tokenAddress }) => tokenAddress === SMVK_TOKEN_ADDRESS)

  const collateralTotalBalance = collateralData[collateralData.length - 1]?.amount

  const handleOpenVault = () => {
    if (isExpanded) return

    params.append('vaultAddress', address)
    history.replace({ ...location, search: params.toString() })
  }

  const handleCloseVault = () => {
    if (!isExpanded) return

    params.delete('vaultAddress')
    history.replace({ ...location, search: params.toString() })
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
              <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} />
              <div className="data">
                <div className="value">{name ? name : symbol}</div>
                <div className="value">
                  <TzAddress tzAddress={address} shouldCopy hasIcon amountFromStart={4} amountFromEnd={4} />
                </div>
              </div>
            </ThreeLevelListItem>
            <ThreeLevelListItem
              className="collateral-diagram"
              customColor={getCollateralRationPersent(collateralRatio)}
            >
              <div className={`percentage`}>
                Collateral Ratio: <CommaNumber value={collateralRatio} endingText="%" showDecimal decimalsToShow={2} />
              </div>
              <GradientDiagram
                className="diagram"
                colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                currentPersentage={getCollateralRatioByPersentage(collateralRatio)}
              />
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Outstanding Debt</div>
              <CommaNumber value={totalOutstanding} className="value" showDecimal decimalsToShow={decimals} />
              <CommaNumber
                value={totalOutstanding * rate}
                beginningText="$"
                className="borrowedTokenRate"
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
              vaultHasXtzCollateral || vaultHasSmvkCollateral ? '' : 'more-padding'
            }`}
          >
            {status && <StatusMessage status={status} timestamp={timerTimestamp} />}

            <div className="block-name">Borrowed</div>
            <div className="borrowed-data">
              <ThreeLevelListItem>
                <div className="name">Asset</div>
                <div className="value">
                  <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} />
                  {symbol}
                </div>
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Principal</div>
                <CommaNumber value={borrowedAmount} decimalsToShow={decimals} className="value" />
                <CommaNumber
                  value={borrowedAmount * rate}
                  decimalsToShow={2}
                  beginningText="$"
                  className="borrowedTokenRate"
                />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">
                  Accrued Interest{' '}
                  <CustomTooltip
                    iconId="info"
                    text="Interest, compounded over time every time you borrow"
                    defaultStrokeColor={colors[themeSelected].textColor}
                  />
                </div>
                <CommaNumber value={fee} decimalsToShow={decimals} className="value" />
                <CommaNumber value={fee * rate} decimalsToShow={2} beginningText="$" className="borrowedTokenRate" />
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
                      const isTotalRow = collateralData.length - 1 === idx
                      const collateral = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })

                      if ((isTotalRow && collateralData.length < 3) || !collateral || !collateral.rate) return null

                      const {
                        symbol: collateralSymbol,
                        decimals: collateralDecimals,
                        icon: collateralIcon,
                        rate: collateralRate,
                      } = collateral

                      const convertedCollalteralAmount = convertNumberForClient({
                        number: amount,
                        grade: collateralDecimals,
                      })

                      const collateralShare = isTotalRow
                        ? 100
                        : getNumberInBounds(
                            0,
                            100,
                            calculateCollateralShare(
                              convertedCollalteralAmount * collateralRate,
                              collateralTotalBalance,
                            ),
                          )

                      return (
                        <TableRow rowHeight={65} key={collateralSymbol}>
                          <TableCell width={'22%'} className="vert-middle">
                            {isTotalRow ? (
                              'Total'
                            ) : (
                              <div className="cell-content row with-icon">
                                <ImageWithPlug imageLink={collateralIcon} alt={`${collateralSymbol} icon`} />
                                {symbol}
                              </div>
                            )}
                          </TableCell>

                          <TableCell width={'22%'}>
                            <div className="cell-content">
                              <CommaNumber
                                value={convertedCollalteralAmount}
                                className="value"
                                showDecimal
                                decimalsToShow={isTotalRow ? 2 : assetDecimalsToShow}
                                beginningText={isTotalRow ? '$' : ''}
                              />
                              <CommaNumber
                                value={convertedCollalteralAmount * collateralRate}
                                className="borrowedTokenRate"
                                beginningText="$"
                                showDecimal
                              />
                            </div>
                          </TableCell>
                          <TableCell width={'22%'}>
                            <div className="cell-content">
                              <CommaNumber value={collateralShare} className="value" endingText="%" />
                            </div>
                          </TableCell>
                          {isTotalRow ? null : (
                            <TableCell className={`buttons borrowing single-btn`}>
                              <div className="cell-content row">
                                <Button
                                  onClick={() =>
                                    openAddExistingCollateralPopup?.({
                                      vaultAddress: vault.address,
                                      borrowedAmount,
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
                                  disabled={isActionActive}
                                >
                                  <Icon id="plus" /> Add
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
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

import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useClickAway } from 'react-use'
import { Link } from 'react-router-dom'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { COLLATERAL_RATIO_GRADIENT, getCollateralRationPersent, getStatusByCollateralRatio } from '../../Loans.const'
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from 'app/App.components/Button/Button.constants'
import colors from 'styles/colors'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import Expand from 'app/App.components/Expand/Expand.view'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatusMessage } from '../StatusMessage.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { scrollToFullView } from 'utils/scrollToFullView'
import { assetDecimalsToShow } from '../../Loans.const'

import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { ThreeLevelListItem } from '../../Loans.style'
import { BorrowingExpandedCard } from '../LoansComponents.style'

import { State } from 'reducers'
import { calculateCollateralShare } from 'pages/Vaults/calcFunctionsForVault'
import { getCollateralRatioByPersentage } from '../../Loans.helpers'
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
} from 'utils/api/api-helpers/getTimestampByLevel'
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'
import { isAbortError } from 'errors/error'
import { api } from 'utils/api/api'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { isTezosAsset } from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import useVault from 'providers/LoansProvider/hooks/useVault'

type BorrowingExpandCardPropsType = {
  vault: LoansVaultType
  isOpenedVault?: boolean
  headerSufix?: React.ReactNode
  children?: React.ReactNode
}

export const OldBorrowingExpandCard = ({
  isOpenedVault,
  headerSufix,
  children,
  vault,
}: BorrowingExpandCardPropsType) => {
  const fullVault = useVault(vault)

  const {
    collateralData,
    name,
    address,
    status,
    levelOfEarly,
    levelOfLate,
    fee,
    apr,
    borrowedAmount,
    collateralRatio,
    borrowedTokenMetadata,
    borrowedTokenRate,
    collateralBalance,
  } = fullVault

  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { symbol, decimals, icon } = borrowedTokenMetadata

  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const { mvkTokenOperators } = useSelector((state: State) => state.loans)

  const { bug } = useToasterContext()

  const [expanded, setExpanded] = useState(false)

  const {
    openAddExistingCollateralPopup,
    changeBakerPopup,
    repayPartPopup,
    repayFullPopup,
    borrowAssetPopup,
    addExistingCollateralPopup,
    addNewCollateralPopup,
    withdrawCollateralPopup,
    updateMvkOperatorPopup,
    managePermissionsPopup,
    liquidateVaultPopup,
  } = useLoansPopupsContext()

  const notHandleClickAway =
    repayPartPopup.showModal ||
    changeBakerPopup.showModal ||
    repayFullPopup.showModal ||
    borrowAssetPopup.showModal ||
    addExistingCollateralPopup.showModal ||
    addNewCollateralPopup.showModal ||
    withdrawCollateralPopup.showModal ||
    updateMvkOperatorPopup.showModal ||
    managePermissionsPopup.showModal ||
    liquidateVaultPopup.showModal ||
    isActionActive

  const ref = useRef<HTMLDivElement | null>(null)

  useClickAway(ref, () => (notHandleClickAway ? null : setExpanded(false)))

  // use for borrow or repay
  // it scrolls until the current vault after the transaction and changing position
  const scrollToCurrentVault = () => {
    scrollToFullView(ref.current, 'nearest')
  }

  const mappedMVKOperators = {
    firstAddress: mvkTokenOperators?.[0],
    ...(mvkTokenOperators ? { amount: mvkTokenOperators.length } : {}),
  }

  const vaultStatus = status ?? getStatusByCollateralRatio(collateralRatio)
  const vaultHasXtzCollateral = collateralData.find(({ tokenAddress }) => isTezosAsset(tokenAddress))
  // TODO: find a method to check whether it's smvk collateral
  const vaultHasSmvkCollateral = false //collateralData.find(({ gqlName }) => gqlName === 'smvk')
  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const collateralTotalBalance = collateralData[collateralData.length - 1]?.amount

  useEffect(() => {
    if (vaultStatus === vaultsStatuses.GRACE_PERIOD || vaultStatus === vaultsStatuses.LIQUIDATABLE) {
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

    return
  }, [vaultStatus, levelOfEarly, levelOfLate])

  useEffect(() => {
    setExpanded(Boolean(isOpenedVault))
  }, [isOpenedVault])

  return (
    <div ref={ref}>
      <Expand
        getExpandedStatus={setExpanded}
        isExpandedByDefault={expanded}
        className={`expand-borrow-tab  ${expanded ? 'expandedCard' : ''}`}
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
              <CommaNumber value={borrowedAmount + fee} className="value" showDecimal decimalsToShow={decimals} />
              {borrowedTokenRate ? (
                <CommaNumber
                  value={(borrowedAmount + fee) * borrowedTokenRate}
                  beginningText="$"
                  className="borrowedTokenRate"
                  showDecimal
                  decimalsToShow={decimals}
                />
              ) : null}
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
            {vaultStatus && <StatusMessage status={vaultStatus} timestamp={timerTimestamp} />}

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
                {borrowedTokenRate ? (
                  <CommaNumber
                    value={borrowedAmount * borrowedTokenRate}
                    decimalsToShow={2}
                    beginningText="$"
                    className="borrowedTokenRate"
                  />
                ) : null}
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
                {borrowedTokenRate ? (
                  <CommaNumber
                    value={fee * borrowedTokenRate}
                    decimalsToShow={2}
                    beginningText="$"
                    className="borrowedTokenRate"
                  />
                ) : null}
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

                      if (isTotalRow && collateralData.length < 3) return null

                      const {
                        symbol: collateralSymbol,
                        decimals: collateralDecimals,
                        icon: collateralIcon,
                      } = tokensMetadata[tokenAddress]
                      const collateralRate = tokensPrices[symbol]

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
                              {borrowedTokenRate ? (
                                <CommaNumber
                                  value={convertedCollalteralAmount * collateralRate}
                                  className="borrowedTokenRate"
                                  beginningText="$"
                                  showDecimal
                                />
                              ) : null}
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
                                      vault,
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
      </Expand>
    </div>
  )
}

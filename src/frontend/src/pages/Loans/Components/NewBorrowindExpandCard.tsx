import { useContext, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useClickAway } from 'react-use'
import { Link } from 'react-router-dom'

import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import {
  ANY_USER,
  COLLATERAL_RATIO_GRADIENT,
  getCollateralRationPersent,
  getStatusByCollateralRatio,
  NONE_USER,
  WHITELIST_USERS,
} from '../Loans.const'
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from 'app/App.components/Button/Button.constants'
import colors from 'styles/colors'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { LoanMarketType, LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import Expand from 'app/App.components/Expand/Expand.view'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { StatusMessage } from './StatusMessage.view'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { scrollToFullView } from 'utils/scrollToFullView'
import { assetDecimalsToShow } from '../Loans.const'

import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { ThreeLevelListItem, BorrowingTabListItemHeader } from '../Loans.style'
import {
  BorrowingTabListItemExpanded,
  BorrowingTabListItemSection,
  BorrowingTabListItemSectionInfo,
  BorrowingTabListItemTabInfo,
} from './LoansComponents.style'

import { loansPopupsContext } from './Modals/LoansModals.provider'

import { State } from 'reducers'
import { calculateCollateralShare } from 'pages/Vaults/calcFunctionsForVault'
import { isTezosAsset } from '../Loans.helpers'
import getTimestampByLevel from 'utils/api/getTimestampByLevel'
import { getNumberInBounds } from 'utils/calcFunctions'
import { TabItem, TabSwitcher } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { TransactionHistory } from './TransactionHistory'

const tabsList: TabItem[] = [
  {
    text: 'Collateral Assets',
    id: 1,
    active: true,
  },
  {
    text: 'TX History',
    id: 2,
    active: false,
  },
  {
    text: 'Useful Info',
    id: 3,
    active: false,
  },
]

const tabNames = {
  COLLATERAL_ASSETS: 1,
  TX_HISTORY: 2,
  USEFUL_INFO: 3,
}

type BorrowingExpandCardPropsType = LoansVaultType & {
  isOwner?: boolean
  isOpenedVault?: boolean
  headerSufix?: React.ReactNode
  children?: React.ReactNode
  status?: string
  DAOFee: number
  currentToken: LoanMarketType
}

export const BorrowingExpandCard = ({
  isOwner = false,
  borrowedAsset,
  collateralData,
  xtzDelegatedTo,
  operators,
  sMVKDelegatedTo,
  vaultId,
  name,
  depositors,
  deporsitorsFlag,
  headerSufix,
  address,
  children,
  status,
  levelOfEarly,
  levelOfLate,
  isOpenedVault,
  fee,
  apr,
  collateralBalance,
  borrowedAmount,
  collateralRatio,
  borrowCapacity,
  avaliableLiq,
  minimumRepay,
  DAOFee,
  currentToken,
}: BorrowingExpandCardPropsType) => {
  const { symbol, icon, rate = 1 } = borrowedAsset

  const { avaliableCollaterals } = useSelector((state: State) => state.tokens)
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState(tabsList.find((item) => item.active))

  const {
    openChangeBakerPopup,
    openAddExistingCollateralPopup,
    openAddNewCollateralPopup,
    openBorrowPopup,
    openManagePermissionsPopup,
    openRepayFullPopup,
    openRepayPopup,
    openUpdateMvkOperatorsPopup,
    openWithdrawCollateralPopup,
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
  } = useContext(loansPopupsContext)

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
    firstAddress: operators?.[0],
    ...(operators ? { amount: operators.length - 1 } : {}),
  }

  const vaultStatus = status ?? getStatusByCollateralRatio(collateralRatio)
  const vaultHasXtzCollateral = collateralData.find(({ gqlName }) => isTezosAsset(gqlName))
  // TODO: test it when sMVK will be avaliable as collateral
  const vaultHasSmvkCollateral = collateralData.find(({ gqlName }) => gqlName === 'smvk')
  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const collateralTotalBalance = collateralData[collateralData.length - 1]?.amount

  const handleSwitchTab = (tabId: number) => {
    setActiveTab(tabsList.find((item) => item.id === tabId))
  }

  useEffect(() => {
    if (vaultStatus === vaultsStatuses.GRACE_PERIOD || vaultStatus === vaultsStatuses.LIQUIDATABLE) {
      ;(async () => {
        if (!levelOfEarly || !levelOfLate) {
          setTimerTimestamp(undefined)
          return
        }

        const [timestampOfEarly, timestampOfLate] = await Promise.all([
          getTimestampByLevel(levelOfEarly),
          getTimestampByLevel(levelOfLate),
        ])

        const timestamp =
          new Date(timestampOfEarly).getTime() - new Date(timestampOfLate).getTime() + new Date().getTime()

        setTimerTimestamp(timestamp)
      })()
    }
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
        openButtonName={'View'}
        header={
          <BorrowingTabListItemHeader>
            <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} />
            <div className="name">{name ? name : borrowedAsset.symbol}</div>
            <span className="change">Change</span>
          </BorrowingTabListItemHeader>
        }
      >
        {children || (
          <BorrowingTabListItemExpanded>
            {vaultStatus && <StatusMessage status={vaultStatus} timestamp={timerTimestamp} />}

            <div className="top">
              <BorrowingTabListItemSection>
                <BorrowingTabListItemSectionInfo hasRate={Boolean(rate)}>
                  <CommaNumber
                    value={borrowedAmount + fee}
                    className="value"
                    showDecimal
                    decimalsToShow={borrowedAsset.decimals}
                  />

                  <CommaNumber
                    value={(borrowedAmount + fee) * rate}
                    beginningText="$"
                    className="rate"
                    showDecimal
                    decimalsToShow={borrowedAsset.decimals}
                  />

                  <div className="name">
                    Outstanding Debt
                    <CustomTooltip
                      iconId="info"
                      text="something"
                      defaultStrokeColor={colors[themeSelected].textColor}
                    />
                  </div>
                </BorrowingTabListItemSectionInfo>

                <BorrowingTabListItemSectionInfo hasRate={Boolean(rate)}>
                  <CommaNumber value={borrowedAmount} decimalsToShow={borrowedAsset.decimals} className="value" />
                  <CommaNumber value={borrowedAmount * rate} decimalsToShow={2} beginningText="$" className="rate" />
                  <div className="name">Principal</div>
                </BorrowingTabListItemSectionInfo>

                <BorrowingTabListItemSectionInfo hasRate={Boolean(rate)}>
                  <CommaNumber
                    value={collateralBalance}
                    className="value"
                    beginningText="$"
                    showDecimal
                    decimalsToShow={2}
                  />
                  <div className="name margin-top">
                    Collateral value
                    <CustomTooltip
                      iconId="info"
                      text="something"
                      defaultStrokeColor={colors[themeSelected].textColor}
                    />
                  </div>
                </BorrowingTabListItemSectionInfo>

                <BorrowingTabListItemSectionInfo hasRate={Boolean(rate)}>
                  <CommaNumber value={fee} decimalsToShow={borrowedAsset.decimals} className="value" />
                  <CommaNumber value={fee * rate} decimalsToShow={2} beginningText="$" className="rate" />
                  <div className="name">
                    Accrued Interest
                    <CustomTooltip
                      iconId="info"
                      text="Interest, compounded over time every time you borrow"
                      defaultStrokeColor={colors[themeSelected].textColor}
                    />
                  </div>
                </BorrowingTabListItemSectionInfo>

                <BorrowingTabListItemSectionInfo hasRate={Boolean(rate)}>
                  <CommaNumber value={apr} decimalsToShow={2} className="value" endingText="%" />
                  <div className="name margin-top">
                    APR
                    <CustomTooltip
                      iconId="info"
                      text="something"
                      defaultStrokeColor={colors[themeSelected].textColor}
                    />
                  </div>
                </BorrowingTabListItemSectionInfo>

                <BorrowingTabListItemSectionInfo hasRate={Boolean(rate)}>
                  <CommaNumber
                    value={borrowCapacity}
                    className="value"
                    beginningText="$"
                    showDecimal
                    decimalsToShow={2}
                  />
                  <div className="name margin-top">
                    Borrow Capacity
                    <CustomTooltip
                      iconId="info"
                      text="something"
                      defaultStrokeColor={colors[themeSelected].textColor}
                    />
                  </div>
                </BorrowingTabListItemSectionInfo>

                <BorrowingTabListItemSectionInfo
                  className="collateral-diagram"
                  customColor={getCollateralRationPersent(collateralRatio)}
                >
                  <div className="percentage">
                    Collateral Ratio:
                    <CommaNumber value={collateralRatio} endingText="%" showDecimal decimalsToShow={2} />
                  </div>
                  <GradientDiagram
                    colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
                    currentPersentage={Math.max(0, Math.min(((collateralRatio - 100) / 150) * 100, 100))}
                  />
                </BorrowingTabListItemSectionInfo>

                <BorrowingTabListItemSectionInfo className="learn-more">
                  <a href="" target="_blank" rel="noreferrer">
                    Learn more at the Mavryk Docs
                  </a>
                </BorrowingTabListItemSectionInfo>
              </BorrowingTabListItemSection>

              <BorrowingTabListItemSection></BorrowingTabListItemSection>
            </div>

            <TabSwitcher tabItems={tabsList} onClick={handleSwitchTab} className="switcher" />

            {activeTab?.id === tabNames.COLLATERAL_ASSETS && (
              <BorrowingTabListItemTabInfo>
                <div className="tab-header">
                  <H2Title>Your Collateralized Assets</H2Title>

                  <Button
                    onClick={() =>
                      openAddNewCollateralPopup?.({
                        vaultAddress: address,
                        vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                        currentCollateralRatio: collateralRatio,
                        borrowedAmount,
                        existingCollaterals: collateralData,
                        borrowedAssetRate: borrowedAsset.rate,
                        borrowCapacity,
                        avaliableLiq,
                      })
                    }
                    kind={BUTTON_PRIMARY}
                    form={BUTTON_WIDE}
                    isThin
                    disabled={
                      avaliableCollaterals.length === 0 ||
                      avaliableCollaterals.length === collateralData.length - 1 ||
                      isActionActive
                    }
                  >
                    <Icon id="plus" /> Add Collateral Type
                  </Button>
                </div>

                <Table className="borrowing-table">
                  {collateralData.length ? (
                    <TableHeader className="simple-header collateral">
                      <TableRow>
                        <TableHeaderCell>Asset</TableHeaderCell>
                        <TableHeaderCell>Amount</TableHeaderCell>
                        <TableHeaderCell>Collateral Share</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                  ) : null}

                  <TableBody>
                    {collateralData.map(({ icon, amount, rate, gqlName, symbol }, idx) => {
                      const isTotalRow = collateralData.length - 1 === idx

                      const collateralShare = isTotalRow
                        ? 100
                        : getNumberInBounds(0, 100, calculateCollateralShare(amount * rate, collateralTotalBalance))

                      if (isTotalRow && collateralData.length < 3) return null

                      return (
                        <TableRow rowHeight={65} key={gqlName + '-' + idx}>
                          <TableCell width={'22%'} className="vert-middle">
                            {isTotalRow ? (
                              'Total'
                            ) : (
                              <div className="cell-content row with-icon">
                                <ImageWithPlug imageLink={icon} alt={`${gqlName} icon`} />
                                {symbol}
                              </div>
                            )}
                          </TableCell>

                          <TableCell width={'22%'}>
                            <div className="cell-content">
                              <CommaNumber
                                value={amount}
                                className="value"
                                showDecimal
                                decimalsToShow={isTotalRow ? 2 : assetDecimalsToShow}
                                beginningText={isTotalRow ? '$' : ''}
                              />
                              {rate ? (
                                <CommaNumber value={amount * rate} className="rate" beginningText="$" showDecimal />
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell width={'22%'}>
                            <div className="cell-content">
                              <CommaNumber value={collateralShare} className="value" endingText="%" />
                            </div>
                          </TableCell>
                          {!isTotalRow && (
                            <TableCell className={`buttons borrowing ${!isOwner ? 'single-btn' : ''}`}>
                              <div className="cell-content row">
                                <Button
                                  onClick={() =>
                                    openAddExistingCollateralPopup?.({
                                      vaultAddress: address,
                                      vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                                      selectedAsset: collateralData[idx],
                                      currentCollateralRatio: collateralRatio,
                                      borrowedAmount,
                                      borrowedAssetRate: borrowedAsset.rate,
                                      borrowCapacity,
                                      avaliableLiq,
                                    })
                                  }
                                  form={BUTTON_WIDE}
                                  kind={BUTTON_SECONDARY}
                                  disabled={isActionActive}
                                >
                                  <Icon id="plus" /> Add
                                </Button>
                                {isOwner ? (
                                  <Button
                                    onClick={() =>
                                      openWithdrawCollateralPopup?.({
                                        vaultAddress: address,
                                        currentCollateralBalance: amount,
                                        vaultCollateralBalance: collateralData.at(-1)?.amount ?? 0,
                                        selectedAsset: collateralData[idx],
                                        currentCollateralRatio: collateralRatio,
                                        borrowedAmount,
                                        borrowedAssetRate: borrowedAsset.rate,
                                      })
                                    }
                                    form={BUTTON_WIDE}
                                    kind={BUTTON_SECONDARY}
                                    disabled={collateralRatio <= 200 || isActionActive}
                                  >
                                    <Icon id="minus" /> Remove
                                  </Button>
                                ) : null}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </BorrowingTabListItemTabInfo>
            )}

            {activeTab?.id === tabNames.TX_HISTORY && <TransactionHistory currentToken={currentToken} />}
          </BorrowingTabListItemExpanded>
        )}
      </Expand>
    </div>
  )
}

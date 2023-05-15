import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useClickAway } from 'react-use'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import {
  VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS,
  VAULT_CARD_REPAY_SLIDING_BUTTONS,
  getStatusByCollateralRatio,
  vaultCardTabNames,
} from 'pages/Loans/Loans.const'

import { LoanMarketType, LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import Expand from 'app/App.components/Expand/Expand.view'
import { StatusMessage } from '../StatusMessage.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { scrollToFullView } from 'utils/scrollToFullView'

import { BorrowingTabListItemHeader } from '../../Loans.style'
import { BorrowingExpandCardActionsSectionStyled, BorrowingTabListItemExpanded } from '../LoansComponents.style'
import { loansPopupsContext } from '../Modals/LoansModals.provider'

import { State } from 'reducers'
import getTimestampByLevel from 'utils/api/getTimestampByLevel'
import { BorrowingExpandCardMenuSection } from './BorrowingExpandCardMenuSection.view'
import { BorrowingExpandCardValuesSection } from './BorrowingExpandCardValuesSection.view'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { BorrowingExpandCardBorrowSection } from './BorrowingExpandCardBorrowSection.view'
import { BorrowingExpandCardRepaySection } from './BorrowingExpandCardRepaySection.view'

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

  const repayBorrowSlidingButtons = useMemo(
    () =>
      VAULT_CARD_REPAY_BORROW_SLIDING_BUTTONS.map((item) => ({
        ...item,
        text: `${item.text} ${borrowedAsset?.symbol}`,
      })),
    [borrowedAsset?.symbol],
  )

  const { isActionActive } = useSelector((state: State) => state.loading)
  const [expanded, setExpanded] = useState(false)

  const [activeRepayBorrowTab, setActiveRepayBorrowTab] = useState(
    repayBorrowSlidingButtons.find((item) => item.active),
  )
  const [activeRepayTab, setActiveRepayTab] = useState(VAULT_CARD_REPAY_SLIDING_BUTTONS.find((item) => item.active))

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
  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const handleSwitchTab = (setActiveTab: (tab?: TabItem) => void) => (tabId: number) => {
    const tabs = repayBorrowSlidingButtons.concat(VAULT_CARD_REPAY_SLIDING_BUTTONS)

    setActiveTab(tabs.find((item) => item.id === tabId))
  }

  const handleClickOpenAddNewCollateralPopup = () => {
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

  const handleClickOpenAddExistingCollateralPopup = (idx: number) => {
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

  const handleClickOpenWithdrawCollateralPopup = ({ amount, idx }: { amount: number; idx: number }) => {
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

  const handleClickOpenChangeBakerPopup = () => {
    openChangeBakerPopup?.({
      bakerAddress: xtzDelegatedTo,
      vaultAddress: address,
    })
  }

  const handleClickOpenManagePermissionsPopup = () => {
    openManagePermissionsPopup?.({
      vaultAddress: address,
      deporsitorsFlag,
      depositors,
    })
  }

  const handleClickOpenUpdateMvkOperatorsPopup = () => {
    openUpdateMvkOperatorsPopup?.({})
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
              <BorrowingExpandCardValuesSection
                collateralRatio={collateralRatio}
                collateralBalance={collateralBalance}
                borrowedAmount={borrowedAmount}
                borrowCapacity={borrowCapacity}
                decimals={borrowedAsset.decimals}
                fee={fee}
                apr={apr}
                rate={rate}
              />

              <BorrowingExpandCardActionsSectionStyled>
                <div className="switchers">
                  <SlidingTabButtons
                    onClick={handleSwitchTab(setActiveRepayBorrowTab)}
                    tabItems={repayBorrowSlidingButtons}
                    className="vault"
                  />
                  {activeRepayBorrowTab?.id === vaultCardTabNames.REPAY && (
                    <SlidingTabButtons
                      onClick={handleSwitchTab(setActiveRepayTab)}
                      tabItems={VAULT_CARD_REPAY_SLIDING_BUTTONS}
                      className="vault"
                    />
                  )}
                </div>

                {activeRepayBorrowTab?.id === vaultCardTabNames.BORROW && (
                  <BorrowingExpandCardBorrowSection
                    vaultId={vaultId}
                    borrowedAsset={borrowedAsset}
                    collateralRatio={collateralRatio}
                    borrowAPR={apr}
                    currentCollateralBalance={collateralData.at(-1)?.amount ?? 0}
                    hasUserBorrowed={Boolean(borrowedAmount)}
                    borrowCapacity={borrowCapacity}
                    currentBorrowedAmount={borrowedAmount}
                    DAOFee={DAOFee}
                    scrollToCurrentVault={scrollToCurrentVault}
                  />
                )}

                {activeRepayBorrowTab?.id === vaultCardTabNames.REPAY &&
                  activeRepayTab?.id === vaultCardTabNames.REPAY_IN_PART && (
                    <BorrowingExpandCardRepaySection
                      vaultId={vaultId}
                      borrowedAsset={borrowedAsset}
                      currentCollateralBalance={collateralData.at(-1)?.amount ?? 0}
                      borrowCapacity={borrowCapacity}
                      scrollToCurrentVault={scrollToCurrentVault}
                      vaultAddress={address}
                      borrowedAmount={borrowedAmount}
                      feesAmount={fee}
                      minimumRepay={minimumRepay}
                    />
                  )}
              </BorrowingExpandCardActionsSectionStyled>
            </div>

            <BorrowingExpandCardMenuSection
              openAddNewCollateralPopup={handleClickOpenAddNewCollateralPopup}
              openAddExistingCollateralPopup={handleClickOpenAddExistingCollateralPopup}
              openWithdrawCollateralPopup={handleClickOpenWithdrawCollateralPopup}
              openChangeBakerPopup={handleClickOpenChangeBakerPopup}
              openManagePermissionsPopup={handleClickOpenManagePermissionsPopup}
              openUpdateMvkOperatorsPopup={handleClickOpenUpdateMvkOperatorsPopup}
              collateralData={collateralData}
              currentToken={currentToken}
              isOwner={isOwner}
              vaultAddress={address}
              xtzDelegatedTo={xtzDelegatedTo}
              sMVKDelegatedTo={sMVKDelegatedTo}
              collateralRatio={collateralRatio}
              deporsitorsFlag={deporsitorsFlag}
              mappedMVKOperators={mappedMVKOperators}
            />
          </BorrowingTabListItemExpanded>
        )}
      </Expand>
    </div>
  )
}

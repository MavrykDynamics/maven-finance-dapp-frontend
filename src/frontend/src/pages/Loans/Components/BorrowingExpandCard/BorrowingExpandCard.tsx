import { useContext, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useClickAway } from 'react-use'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { getStatusByCollateralRatio } from 'pages/Loans/Loans.const'

import { LoanMarketType, LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import Expand from 'app/App.components/Expand/Expand.view'
import { StatusMessage } from '../StatusMessage.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { scrollToFullView } from 'utils/scrollToFullView'

import { BorrowingTabListItemHeader } from '../../Loans.style'
import { BorrowingTabListItemExpanded } from '../LoansComponents.style' 
import { loansPopupsContext } from '../Modals/LoansModals.provider'

import { State } from 'reducers'
import getTimestampByLevel from 'utils/api/getTimestampByLevel'
import { BorrowingExpandCardMenuSection } from './BorrowingExpandCardMenuSection.view'
import { BorrowingExpandCardActionsSection } from './BorrowingExpandCardActionsSection.view'
import { BorrowingExpandCardValuesSection } from './BorrowingExpandCardValuesSection.view'

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
  const { isActionActive } = useSelector((state: State) => state.loading)
  const [expanded, setExpanded] = useState(false)

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
              <BorrowingExpandCardActionsSection />
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

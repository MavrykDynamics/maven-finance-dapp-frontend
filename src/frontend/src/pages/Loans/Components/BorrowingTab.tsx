import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useContext, useState } from 'react'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import { loansPopupsContext } from './Modals/LoansModals.provider'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { State } from 'reducers'

import { Button } from 'app/App.components/Button/Button.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BorrowingExpandCard } from './BorrowindExpandCard'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { LoansTabStyled, NoItemsInTabStyled } from './LoansComponents.style'

type BorrowingTabPropsType = {
  borrowingItems: Array<LoansVaultType>
  lendingControllerAddress: string
  currentMarketAsset: string
}

export const BorrowingTab = ({
  borrowingItems,
  lendingControllerAddress,
  currentMarketAsset,
}: BorrowingTabPropsType) => {
  const { openCreateVaultPopup } = useContext(loansPopupsContext)
  const { xtzBakers } = useSelector((state: State) => state.loans)

  const [createdVaultId, setCreatedVaultAddress] = useState<null | string>(null)
  const [showZeroVaults, setShowZeroVaults] = useState(false)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    config: { DAOFee },
  } = useSelector((state: State) => state.loans)

  const vaults = useMemo(() => {
    return showZeroVaults
      ? borrowingItems.filter(({ collateralBalance, borrowedAmount }) => collateralBalance || borrowedAmount)
      : borrowingItems
  }, [borrowingItems, showZeroVaults])

  return (
    <LoansTabStyled>
      <GovRightContainerTitleArea>
        <h2>My Borrowing</h2>
      </GovRightContainerTitleArea>

      {vaults.length ? (
        <>
          <Checkbox
            id="show_dropped"
            onChangeHandler={() => setShowZeroVaults(!showZeroVaults)}
            checked={showZeroVaults}
            className="checkbox"
          >
            <span>Hide vaults with a loan balance of 0</span>
          </Checkbox>

          <Button
            text="New Vault"
            icon="plus"
            disabled={!Boolean(accountPkh)}
            onClick={() => openCreateVaultPopup({ currentMarketAsset, setCreatedVaultAddress })}
            kind={ACTION_PRIMARY}
            className="lending-tab-no-items-btn has-items-borrow-btn"
          />
          <div className="list-wrapper">
            {vaults.map((item, idx) => {
              return (
                <BorrowingExpandCard
                  isOwner
                  {...item}
                  key={item.borrowedAsset.symbol + '-' + idx}
                  isOpenedVault={createdVaultId === item.address}
                  DAOFee={DAOFee}
                  xtzBakers={xtzBakers}
                />
              )
            })}
          </div>
        </>
      ) : (
        <NoItemsInTabStyled>
          <span>To borrow, you must first create a vault and add collateral.</span>
          <Button
            text="New Vault"
            icon="plus"
            kind={ACTION_PRIMARY}
            disabled={!Boolean(accountPkh)}
            onClick={() => openCreateVaultPopup({ currentMarketAsset, setCreatedVaultAddress })}
            className="lending-tab-no-items-btn"
          />
        </NoItemsInTabStyled>
      )}
      <div className="factory-info">
        Lending Controller Address <TzAddress tzAddress={lendingControllerAddress} type={BLUE} />
      </div>
    </LoansTabStyled>
  )
}

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

import { LoansTabStyled, NoItemsInTabStyled, VaultsList } from './LoansComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

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

  const [createdVaultId, setCreatedVaultAddress] = useState<null | string>(null)
  const [showZeroVaults, setShowZeroVaults] = useState(false)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)
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
      <H2Title>My Borrowing</H2Title>

      {vaults.length ? (
        <>
          <Checkbox
            id="borrowing-tab-zero-filter"
            onChangeHandler={() => setShowZeroVaults(!showZeroVaults)}
            checked={showZeroVaults}
            className="checkbox"
          >
            <span>Hide vaults with a loan balance of 0</span>
          </Checkbox>

          <Button
            text="New Vault"
            icon="plus"
            disabled={!Boolean(accountPkh) || isActionActive}
            onClick={() => openCreateVaultPopup({ currentMarketAsset, setCreatedVaultAddress })}
            kind={ACTION_PRIMARY}
            className="lending-tab-no-items-btn has-items-borrow-btn"
          />
          <VaultsList>
            {vaults.map((item, idx) => {
              return (
                <BorrowingExpandCard
                  isOwner
                  {...item}
                  key={item.borrowedAsset.symbol + '-' + idx}
                  isOpenedVault={createdVaultId === item.address}
                  DAOFee={DAOFee}
                />
              )
            })}
          </VaultsList>
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

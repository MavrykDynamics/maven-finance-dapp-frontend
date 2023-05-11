import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useContext, useState } from 'react'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { loansPopupsContext } from './Modals/LoansModals.provider'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { State } from 'reducers'

import { Button } from 'app/App.components/Button/Button.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { BorrowingExpandCard } from './NewBorrowindExpandCard'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'

import { LoansTabStyled, NoItemsInTabStyled, VaultsList } from './LoansComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

import { LoanMarketType } from 'utils/TypesAndInterfaces/Loans'

type BorrowingTabPropsType = {
  lendingControllerAddress: string
  currentToken: LoanMarketType
}

export const BorrowingTab = ({ lendingControllerAddress, currentToken }: BorrowingTabPropsType) => {
  const { openCreateVaultPopup } = useContext(loansPopupsContext)

  const {
    loanTokenData: { gqlName },
  } = currentToken

  const [createdVaultId, setCreatedVaultAddress] = useState<null | string>(null)
  const [showZeroVaults, setShowZeroVaults] = useState(false)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const {
    config: { DAOFee },
    vaults: { myVaultsIds, vaultsMapper },
  } = useSelector((state: State) => state.loans)

  const userMarketVaultsIds = useMemo(
    () =>
      myVaultsIds.filter((vaultId) => {
        const vault = vaultsMapper[vaultId]

        return showZeroVaults
          ? gqlName === vault.borrowedAsset.gqlName && (vault.collateralBalance || vault.borrowedAmount)
          : gqlName === vault.borrowedAsset.gqlName
      }),
    [gqlName, myVaultsIds, showZeroVaults, vaultsMapper],
  )

  return (
    <LoansTabStyled>
      <H2Title>My Borrowing</H2Title>

      {userMarketVaultsIds.length ? (
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
            onClick={() => openCreateVaultPopup({ currentMarketAsset: gqlName, setCreatedVaultAddress })}
            kind={ACTION_PRIMARY}
            className="lending-tab-no-items-btn has-items-borrow-btn"
          />
          <VaultsList>
            {userMarketVaultsIds.map((vaultId, idx) => {
              const vault = vaultsMapper[vaultId]
              return (
                <BorrowingExpandCard
                  isOwner
                  {...vault}
                  key={vault.borrowedAsset.symbol + '-' + idx}
                  isOpenedVault={createdVaultId === vault.address}
                  DAOFee={DAOFee}
                  currentToken={currentToken}
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
            onClick={() => openCreateVaultPopup({ currentMarketAsset: gqlName, setCreatedVaultAddress })}
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

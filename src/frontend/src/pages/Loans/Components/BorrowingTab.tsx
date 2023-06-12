import { useEffect, useMemo } from 'react'
import { useHistory, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { useState } from 'react'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { State } from 'reducers'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

import { Button } from 'app/App.components/Button/Button.controller'
import { BorrowingExpandCard } from './BorrowingExpandCard/BorrowingExpandCard'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'

import { BorrowingTabStyled, NoItemsInTabStyled, VaultsList } from './LoansComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'

type BorrowingTabPropsType = {
  loanTokenAddress: TokenAddressType
}

export const BorrowingTab = ({ loanTokenAddress }: BorrowingTabPropsType) => {
  const history = useHistory()
  const { cardId = null } = useParams<{ cardId: string }>()

  const { openCreateVaultPopup } = useLoansPopupsContext()
  const { tokensMetadata } = useTokensContext()

  const { symbol } = tokensMetadata[loanTokenAddress]

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

        const vaultHasBalance = vault.collateralData.find(({ amount }) => amount) || vault.borrowedAmount

        const isVaultValidForMarket = vault.borrowedTokenAddress === loanTokenAddress

        return isVaultValidForMarket && (showZeroVaults ? vaultHasBalance : true)
      }),
    [loanTokenAddress, myVaultsIds, showZeroVaults, vaultsMapper],
  )

  useEffect(() => {
    if (!cardId) return
    setCreatedVaultAddress(cardId)
    history.push(`/loans/${symbol}/borrowTab`)
  }, [cardId])

  return (
    <BorrowingTabStyled>
      {userMarketVaultsIds.length ? (
        <>
          <div className="title-block">
            <H2Title>Your {symbol} Vaults</H2Title>

            <Button
              text="New Vault"
              icon="plus"
              disabled={!Boolean(accountPkh) || isActionActive}
              onClick={() => openCreateVaultPopup({ tokenAddress: loanTokenAddress, setCreatedVaultAddress })}
              kind={ACTION_PRIMARY}
              className="lending-tab-no-items-btn has-items-borrow-btn"
            />
          </div>

          <Checkbox
            id="borrowing-tab-zero-filter"
            onChangeHandler={() => setShowZeroVaults(!showZeroVaults)}
            checked={showZeroVaults}
            className="checkbox"
          >
            <span>Hide vaults with a loan balance of 0</span>
          </Checkbox>

          <VaultsList>
            {userMarketVaultsIds.map((vaultId) => {
              const vault = vaultsMapper[vaultId]
              return (
                <BorrowingExpandCard
                  isOwner
                  {...vault}
                  key={vault.address}
                  isOpenedVault={createdVaultId === vault.address}
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
            onClick={() => openCreateVaultPopup({ tokenAddress: loanTokenAddress, setCreatedVaultAddress })}
            className="lending-tab-no-items-btn"
          />
        </NoItemsInTabStyled>
      )}
    </BorrowingTabStyled>
  )
}

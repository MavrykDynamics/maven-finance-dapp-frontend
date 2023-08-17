import { useHistory, useLocation } from 'react-router'
import { useMemo } from 'react'
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
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'

type BorrowingTabPropsType = {
  loanTokenAddress: TokenAddressType
  marketAvaliableLiquidity: number
}

export const BorrowingTab = ({ marketAvaliableLiquidity, loanTokenAddress }: BorrowingTabPropsType) => {
  const history = useHistory()
  const location = useLocation()

  const { openCreateVaultPopup } = useLoansPopupsContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { myVaultsIds, vaultsMapper, isLoading: isVaultsLoading } = useVaultsContext()
  const {
    config: { daoFee },
  } = useLoansContext()

  const loanToken = getTokenDataByAddress({ tokensMetadata, tokensPrices, tokenAddress: loanTokenAddress })

  const [showZeroVaults, setShowZeroVaults] = useState(false)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const userMarketVaultsIds = useMemo(
    () =>
      myVaultsIds.filter((vaultId) => {
        const vault = vaultsMapper[vaultId]

        if (vault.borrowedTokenAddress !== loanTokenAddress) return false

        return showZeroVaults
          ? vault.collateralData.find(({ amount }) => amount.toNumber() > 0) || vault.borrowedAmount
          : true
      }),
    [loanTokenAddress, myVaultsIds, showZeroVaults, vaultsMapper],
  )

  if (!loanToken || !loanToken.rate) return null

  const { symbol, rate, decimals } = loanToken

  const handleCreatedVaultAddress = (address?: string) => {
    if (!address) return

    const params = new URLSearchParams(location.search)
    params.append('vaultAddress', address)
    history.replace({ ...location, search: params.toString() })
  }

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
              onClick={() =>
                openCreateVaultPopup({
                  marketTokenAddress: loanTokenAddress,
                  setCreatedVaultAddress: handleCreatedVaultAddress,
                  avaliableLiquidity:
                    convertNumberForClient({ number: marketAvaliableLiquidity, grade: decimals }) * rate,
                })
              }
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
              return <BorrowingExpandCard isOwner vault={vault} key={vault.address} DAOFee={daoFee} />
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
            onClick={() =>
              openCreateVaultPopup({
                marketTokenAddress: loanTokenAddress,
                setCreatedVaultAddress: handleCreatedVaultAddress,
                avaliableLiquidity:
                  convertNumberForClient({ number: marketAvaliableLiquidity, grade: decimals }) * rate,
              })
            }
            className="lending-tab-no-items-btn"
          />
        </NoItemsInTabStyled>
      )}
    </BorrowingTabStyled>
  )
}

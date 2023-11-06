import { useHistory, useLocation } from 'react-router'
import { useMemo, useState } from 'react'

import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

import Button from 'app/App.components/Button/NewButton'
import { BorrowingExpandCard } from './BorrowingExpandCard/BorrowingExpandCard'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'

import { BorrowingTabStyled, NoItemsInTabStyled, VaultsList } from './LoansComponents.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import Icon from 'app/App.components/Icon/Icon.view'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type BorrowingTabPropsType = {
  loanTokenAddress: TokenAddressType
  marketAvaliableLiquidity: number
}

export const BorrowingTab = ({ marketAvaliableLiquidity, loanTokenAddress }: BorrowingTabPropsType) => {
  const history = useHistory()
  const location = useLocation()

  const { openCreateVaultPopup } = useLoansPopupsContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { myVaultsIds, vaultsMapper } = useVaultsContext()
  const { userAddress } = useUserContext()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const {
    config: { daoFee },
  } = useLoansContext()

  const loanToken = getTokenDataByAddress({ tokensMetadata, tokensPrices, tokenAddress: loanTokenAddress })

  const [showZeroVaults, setShowZeroVaults] = useState(false)

  const userMarketVaultsIds = useMemo(
    () =>
      myVaultsIds.filter((vaultId) => {
        const vault = vaultsMapper[vaultId]

        if (vault.borrowedTokenAddress !== loanTokenAddress) return false

        return showZeroVaults ? vault.collateralData.find(({ amount }) => amount > 0) || vault.borrowedAmount : true
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
              kind={BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              disabled={!Boolean(userAddress) || isActionActive}
              onClick={() =>
                openCreateVaultPopup({
                  marketTokenAddress: loanTokenAddress,
                  setCreatedVaultAddress: handleCreatedVaultAddress,
                  availableLiquidity:
                    convertNumberForClient({
                      number: marketAvaliableLiquidity,
                      grade: decimals,
                    }) * rate,
                })
              }
            >
              <Icon id="plus" />
              New Vault
            </Button>
          </div>

          <Checkbox
            id="borrowing-tab-zero-filter"
            onChangeHandler={() => setShowZeroVaults(!showZeroVaults)}
            checked={showZeroVaults}
          >
            Hide vaults with a loan balance of 0
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

          <div className="manage-btn">
            <Button
              kind={BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              disabled={!Boolean(userAddress)}
              onClick={() =>
                openCreateVaultPopup({
                  marketTokenAddress: loanTokenAddress,
                  setCreatedVaultAddress: handleCreatedVaultAddress,
                  availableLiquidity:
                    convertNumberForClient({
                      number: marketAvaliableLiquidity,
                      grade: decimals,
                    }) * rate,
                })
              }
            >
              <Icon id="plus" />
              New Vault
            </Button>
          </div>
        </NoItemsInTabStyled>
      )}
    </BorrowingTabStyled>
  )
}

import { useEffect, useMemo, useState } from 'react'

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
import { useLocation, useNavigate } from 'react-router-dom'
import {
  DEFAULT_VAULTS_ACTIVE_SUBS,
  PAGINATION_MY,
  VAULTS_DATA,
  VAULTS_LIMIT,
  VAULTS_USER_ALL,
} from 'providers/VaultsProvider/vaults.provider.consts'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { BORROW_LIST_NAME, getPageNumber, getTotalPages } from 'app/App.components/Pagination/pagination.consts'
import Pagination from 'app/App.components/Pagination/Pagination.view'

type BorrowingTabPropsType = {
  loanTokenAddress: TokenAddressType
  marketAvaliableLiquidity: number
}

export const BorrowingTab = ({ marketAvaliableLiquidity, loanTokenAddress }: BorrowingTabPropsType) => {
  const navigate = useNavigate()
  const location = useLocation()

  const { openCreateVaultPopup } = useLoansPopupsContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    myVaultsIds,
    myVaultsMapper,
    changeVaultsSubscriptionsList,
    isLoading: isVaultsLoading,
    vaultsPaginationStats: { my: myVaultsCount },
    changePage,
    changeUserVaultsQueryBasedOnMarket,
  } = useVaultsContext()

  const { userAddress } = useUserContext()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const {
    config: { daoFee },
  } = useLoansContext()

  // Subscribe to fetch only user vaults
  useEffect(() => {
    changeVaultsSubscriptionsList({
      [VAULTS_DATA]: VAULTS_USER_ALL,
    })

    return () => {
      changeVaultsSubscriptionsList(DEFAULT_VAULTS_ACTIVE_SUBS)
    }
  }, [])

  // URL pagination if user has more than 10 vaults per market
  const currentPage = useMemo(() => getPageNumber(location.search, BORROW_LIST_NAME), [location.search])

  useEffect(() => {
    changePage(currentPage, PAGINATION_MY)
  }, [currentPage])

  const loanToken = getTokenDataByAddress({ tokensMetadata, tokensPrices, tokenAddress: loanTokenAddress })

  // set market address for the user queryto fetch only vaults for this market, by default it is emty string
  // so it will fetch all user vaults
  useEffect(() => {
    if (loanToken?.address) {
      changeUserVaultsQueryBasedOnMarket(loanToken.address)
    }

    return () => {
      changeUserVaultsQueryBasedOnMarket('')
    }
  }, [changeUserVaultsQueryBasedOnMarket, loanToken?.address])

  const [showZeroVaults, setShowZeroVaults] = useState(false)

  const userMarketVaultsIds = useMemo(
    () =>
      myVaultsIds.filter((vaultId) => {
        const vault = myVaultsMapper[vaultId]

        if (vault.borrowedTokenAddress !== loanTokenAddress) return false

        return showZeroVaults ? vault.collateralData.find(({ amount }) => amount > 0) || vault.borrowedAmount : true
      }),
    [myVaultsIds, myVaultsMapper, loanTokenAddress, showZeroVaults],
  )
  // get total pages for pagination
  const totalPages = useMemo(() => getTotalPages(myVaultsCount, VAULTS_LIMIT), [myVaultsCount])

  if (!loanToken || !loanToken.rate) return null

  const { symbol, rate, decimals } = loanToken

  const handleCreatedVaultAddress = (address?: string) => {
    if (!address) return

    const params = new URLSearchParams(location.search)
    params.append('vaultAddress', address)
    navigate({ ...location, search: params.toString() }, { replace: true })
  }

  return (
    <BorrowingTabStyled>
      {isVaultsLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading vaults...</div>
        </DataLoaderWrapper>
      ) : userMarketVaultsIds.length ? (
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
              const vault = myVaultsMapper[vaultId]
              return <BorrowingExpandCard isOwner vault={vault} key={vault.address} DAOFee={daoFee} />
            })}
            <Pagination itemsCount={totalPages} listName={BORROW_LIST_NAME} />
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

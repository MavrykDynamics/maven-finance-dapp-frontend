import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react'
import qs from 'qs'
import { useNavigate, useLocation, useParams } from 'react-router-dom'

// components
import { Input } from 'app/App.components/Input/Input.controller'
import { DDItemId, DropDown, getDdItem } from 'app/App.components/DropDown/NewDropdown'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'

// styles
import {
  VaultsSearchFilterStyled,
  VaultsSearchFilterWrapper,
  VaultsFilters,
  VaultsFilterOptions,
} from './../Vaults.style'

// helpers
import {
  sortVaultItems,
  sortingList,
  vaultsPathname,
  vaultsFilters,
  ALL_VAULTS_FILTER,
  COLLATERAL_NAME,
  BORROWED_NAME,
  SortVaultOption,
} from '../Vaults.consts'

// types
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { TokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { PaginationVaultType } from 'providers/VaultsProvider/vaults.provider.consts'
import Button from 'app/App.components/Button/NewButton'
import {
  Advanced_Gql_Vault_With_Balances_Bool_Exp,
  getFilterBorrowedQuery,
  getFilterCollateralQuery,
  getSearchQueryForWhereFilter,
  getVaultsOrderByQuery,
  HIDE_VAULT_ZERO_BALANCES,
} from '../utils/filterQueries'
import { useDebouncedSearch } from 'app/App.hooks/useDebouncedSerach'
import { useUserContext } from 'providers/UserProvider/user.provider'

type Filters = Record<string, string>

const prepareFilterBasedOnMatkets = (marketsAddresses: string[], tokensMetadata: Record<string, TokenMetadataType>) => {
  return {
    preparedCollateralAssets: marketsAddresses.reduce<Record<string, string>>((acc, address) => {
      const loanToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: address })
      if (!loanToken) return acc
      acc[`${COLLATERAL_NAME}, ${loanToken?.symbol}`] = address
      return acc
    }, {}),

    preparedLoanAssets: marketsAddresses.reduce<Record<string, string>>((acc, address) => {
      const loanToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: address })
      if (!loanToken) return acc
      acc[`${BORROWED_NAME}, ${loanToken?.symbol}`] = address
      return acc
    }, {}),
  }
}

export const VaultsSearchFilter = memo(() => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const { tabId = 'all' } = useParams<{ tabId: PaginationVaultType }>()
  const hasAutoAppliedRef = useRef(false)

  const { marketsAddresses } = useLoansContext()
  const { userAddress } = useUserContext()
  const { tokensMetadata } = useTokensContext()
  const { updateVaultQueryFilters, setIsPendingQueryWhenFilters, isPendingQueryWhenFilters, resetVaultFilters } =
    useVaultsContext()

  const { preparedCollateralAssets, preparedLoanAssets } = useMemo(
    () => prepareFilterBasedOnMatkets(marketsAddresses, tokensMetadata),
    [marketsAddresses, tokensMetadata],
  )

  const preparedAssets = useMemo(
    () => [ALL_VAULTS_FILTER].concat(Object.keys(preparedCollateralAssets)).concat(Object.keys(preparedLoanAssets)),
    [preparedCollateralAssets, preparedLoanAssets],
  )

  // use MOST_RECENT and ALL_VAULTS_FILTER as the default filters value
  const {
    sort = sortVaultItems.MOST_RECENT,
    assets = ALL_VAULTS_FILTER,
    zero = '',
    ...restQP
  } = qs.parse(search, { ignoreQueryPrefix: true })

  const filterDdItems = useMemo(() => preparedAssets.map((item) => getDdItem(item)), [preparedAssets])
  const sortDdItems = useMemo(() => sortingList.map((item) => getDdItem(item)), [])

  const [filterStatuses, setFilterStatuses] = useState<{ [key: string]: boolean }>({})
  const [chosenDdItem, setChosenDdItem] = useState<Filters>({
    [vaultsFilters.ASSETS]: assets as string,
    [vaultsFilters.SORT]: sort as string,
  })

  // reset filters on compponent unmount
  const resetFilters = useCallback(() => {
    resetVaultFilters()
    setChosenDdItem({
      [vaultsFilters.ASSETS]: ALL_VAULTS_FILTER,
      [vaultsFilters.SORT]: sortVaultItems.MOST_RECENT,
    })

    setFilterStatuses({})
  }, [tabId])

  useEffect(() => {
    return () => {
      resetFilters()
    }
  }, [tabId])

  // Search --------------
  const { inputValue, debouncedValue, handleChange } = useDebouncedSearch()
  const hasTouchedInput = useRef(false)

  const handleDropdownSelect = (name: string) => (selectedOption: DDItemId) => {
    setFilterStatuses((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))

    let updatedChosenDdItem = {
      ...chosenDdItem,
      [name]: selectedOption as string,
    }

    if (selectedOption === chosenDdItem[name]) return

    applyFilters(updatedChosenDdItem)
  }

  const applyFilters = useCallback(
    async (filtersList: Filters) => {
      const withoutEmptyFilters = Object.fromEntries(Object.entries(filtersList).filter((item) => item[1]))
      const stringifiedQP = qs.stringify({ ...withoutEmptyFilters, ...restQP })

      navigate(`${vaultsPathname}/${tabId}?${stringifiedQP}`, { replace: true })

      setChosenDdItem(withoutEmptyFilters)
    },
    [restQP, navigate, tabId],
  )

  const handleClickCheckbox = () => {
    const status = filterStatuses[vaultsFilters.ZERO] ? '' : 'checked'
    handleDropdownSelect(vaultsFilters.ZERO)(status)
  }

  const applyServerFilters = useCallback(() => {
    if (!userAddress && (tabId === 'my' || tabId === 'permissioned')) return
    let whereQuery: Partial<Advanced_Gql_Vault_With_Balances_Bool_Exp> = { where: {}, shadowWhere: {} } // default values, sort desc, fetch all vaults based on tab (all, user, permissioned - where u can deposit)

    const { assets, sort, zero } = chosenDdItem
    if (assets.includes(COLLATERAL_NAME)) {
      whereQuery = getFilterCollateralQuery(preparedCollateralAssets[assets])
    }

    if (assets.includes(BORROWED_NAME)) {
      whereQuery = getFilterBorrowedQuery(preparedLoanAssets[assets])
    }

    const orderByQuery = getVaultsOrderByQuery(sort as SortVaultOption)

    if (zero === 'checked')
      whereQuery = {
        where: { ...whereQuery.where, ...HIDE_VAULT_ZERO_BALANCES },
        shadowWhere: { ...whereQuery.shadowWhere, ...HIDE_VAULT_ZERO_BALANCES },
      }

    if (hasTouchedInput.current) {
      const searchFilterQuery = getSearchQueryForWhereFilter(debouncedValue)

      whereQuery = {
        ...whereQuery,
        where: { ...whereQuery.where, ...searchFilterQuery.where },
        shadowWhere: { ...whereQuery.shadowWhere, ...searchFilterQuery.shadowWhere },
      }
    }

    const query = { ...whereQuery, ...orderByQuery }

    updateVaultQueryFilters(query, tabId)
    setIsPendingQueryWhenFilters(true)
  }, [
    chosenDdItem,
    updateVaultQueryFilters,
    tabId,
    debouncedValue,
    setIsPendingQueryWhenFilters,
    preparedCollateralAssets,
    preparedLoanAssets,
  ])

  // search filter
  useEffect(() => {
    if (!hasTouchedInput.current) return
    applyServerFilters()
  }, [debouncedValue, tabId])

  // APply filters on the first render it URL has params
  useEffect(() => {
    const isAssetsReady = Object.keys(preparedCollateralAssets).length > 0 || Object.keys(preparedLoanAssets).length > 0

    if (!hasAutoAppliedRef.current && isAssetsReady) {
      applyServerFilters()
      hasAutoAppliedRef.current = true
    }
  }, [preparedCollateralAssets, preparedLoanAssets])

  return (
    <VaultsSearchFilterWrapper>
      <VaultsSearchFilterStyled>
        <Input
          type="text"
          kind={'search'}
          placeholder="Search by address"
          onChange={(e) => {
            hasTouchedInput.current = true
            handleChange(e.target.value)
          }}
          value={inputValue}
          disabled={isPendingQueryWhenFilters}
        />
        <VaultsFilters>
          <div className="filter">
            <h4>Filter by:</h4>

            <DropDown
              className="assetsFilter"
              placeholder="All Assets"
              activeItem={getDdItem(chosenDdItem[vaultsFilters.ASSETS])}
              items={filterDdItems}
              clickItem={handleDropdownSelect(vaultsFilters.ASSETS)}
              disabled={isPendingQueryWhenFilters}
            />
          </div>

          <div className="filter">
            <h4>Order by:</h4>

            <DropDown
              placeholder={sortVaultItems.MOST_RECENT}
              activeItem={getDdItem(chosenDdItem[vaultsFilters.SORT])}
              items={sortDdItems}
              clickItem={handleDropdownSelect(vaultsFilters.SORT)}
              disabled={isPendingQueryWhenFilters}
            />
          </div>
        </VaultsFilters>
      </VaultsSearchFilterStyled>
      <VaultsFilterOptions>
        <div className="checkbox-wrapper">
          <Checkbox
            id="vaults-zero-filter"
            onChangeHandler={handleClickCheckbox}
            checked={chosenDdItem[vaultsFilters.ZERO] === 'checked'}
          >
            Hide vaults with a loan balance of 0
          </Checkbox>
        </div>

        <div className="vaultFilterBtns">
          <Button kind="primary" size="large" onClick={applyServerFilters} disabled={isPendingQueryWhenFilters}>
            Apply
          </Button>
        </div>
      </VaultsFilterOptions>
    </VaultsSearchFilterWrapper>
  )
})

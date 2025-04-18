import { useState, useCallback, useMemo, FC } from 'react'
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
import { PaginationVaultType, VAULTS_DEFFAULT_FILTERS } from 'providers/VaultsProvider/vaults.provider.consts'
import Button from 'app/App.components/Button/NewButton'
import { getFilterBorrowedQuery, getFilterCollateralQuery, getVaultsOrderByQuery } from '../utils/filterQueries'

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

export const VaultsSearchFilter: FC<{ activeTabId: PaginationVaultType }> = ({ activeTabId }) => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const { tabId = activeTabId } = useParams<{ tabId: PaginationVaultType }>()

  const { marketsAddresses } = useLoansContext()
  const { tokensMetadata } = useTokensContext()
  const { updateVaultQueryFilters } = useVaultsContext()

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

  const [searchInputValue, setSearchInput] = useState('')

  const [filterStatuses, setFilterStatuses] = useState<{ [key: string]: boolean }>({})
  const [chosenDdItem, setChosenDdItem] = useState<Filters>({
    [vaultsFilters.ASSETS]: ALL_VAULTS_FILTER,
    [vaultsFilters.SORT]: sortVaultItems.MOST_RECENT,
  })

  const handleSearch = (searchValue: string, searchData: string[]) => {
    const searchQuery = searchValue.toLowerCase()

    console.log(searchQuery, '----')

    setSearchInput(searchValue)
  }

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
    let whereQuery = {} // default values, sort desc, fetch all vaults based on tab (all, user, permissioned - where u can deposit)

    const { assets, sort } = chosenDdItem
    if (assets.includes(COLLATERAL_NAME)) {
      whereQuery = getFilterCollateralQuery(preparedCollateralAssets[assets])
    }

    if (assets.includes(BORROWED_NAME)) {
      whereQuery = getFilterBorrowedQuery(preparedCollateralAssets[assets])
    }

    const orderByQuery = getVaultsOrderByQuery(sort as SortVaultOption)

    const query = { ...whereQuery, ...orderByQuery }

    updateVaultQueryFilters(query, tabId)
    setChosenDdItem({
      [vaultsFilters.ASSETS]: ALL_VAULTS_FILTER,
      [vaultsFilters.SORT]: sortVaultItems.MOST_RECENT,
    })
  }, [chosenDdItem, preparedCollateralAssets, tabId, updateVaultQueryFilters])

  const resetFilters = useCallback(() => {
    updateVaultQueryFilters(VAULTS_DEFFAULT_FILTERS[tabId], tabId)
    setChosenDdItem({
      [vaultsFilters.ASSETS]: ALL_VAULTS_FILTER,
      [vaultsFilters.SORT]: sortVaultItems.MOST_RECENT,
    })

    setFilterStatuses({})
  }, [tabId, updateVaultQueryFilters])

  return (
    <VaultsSearchFilterWrapper>
      <VaultsSearchFilterStyled>
        <Input
          type="text"
          kind={'search'}
          placeholder="Search by address"
          onChange={() =>
            applyFilters({
              sort,
              assets,
              zero,
            } as Filters)
          }
          value={searchInputValue}
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
            />
          </div>

          <div className="filter">
            <h4>Order by:</h4>

            <DropDown
              placeholder={sortVaultItems.MOST_RECENT}
              activeItem={getDdItem(chosenDdItem[vaultsFilters.SORT])}
              items={sortDdItems}
              clickItem={handleDropdownSelect(vaultsFilters.SORT)}
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
          <Button kind="primary" size="large" onClick={applyServerFilters}>
            Apply
          </Button>
        </div>
      </VaultsFilterOptions>
    </VaultsSearchFilterWrapper>
  )
}

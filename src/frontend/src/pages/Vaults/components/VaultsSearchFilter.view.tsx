import { useState, useCallback, useMemo } from 'react'
import qs from 'qs'
import { useNavigate, useLocation, useParams } from 'react-router-dom'

// components
import { Input } from 'app/App.components/Input/Input.controller'
import { DDItemId, DropDown, getDdItem } from 'app/App.components/DropDown/NewDropdown'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'

// styles
import { VaultsSearchFilterStyled, VaultsSearchFilterWrapper, VaultsFilters } from './../Vaults.style'

// helpers
import {
  sortVaultItems,
  sortingList,
  vaultsPathname,
  vaultsFilters,
  ALL_VAULTS_FILTER,
  COLLATERAL_NAME,
  BORROWED_NAME,
} from '../Vaults.consts'
import { stringFullCharsCompare } from 'utils/stringFullCharsCompare'

// types
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { LoanMarketType } from 'providers/LoansProvider/loans.provider.types'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { TokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

type Filters = Record<string, string>

const prepareFilterBasedOnMatkets = (
  marketsAddresses: string[],
  marketsMapper: Record<string, LoanMarketType>,
  tokensMetadata: Record<string, TokenMetadataType>,
): Record<string, Array<string>> => {
  return {
    preparedCollateralAssets: marketsAddresses.map((address) => {
      const loanToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: address })
      return `${COLLATERAL_NAME}, ${loanToken?.symbol ?? 'Unknown'}`
    }),
    preparedLoanAssets: marketsAddresses.map((address) => {
      const loanToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: address })
      return `${BORROWED_NAME}, ${loanToken?.symbol ?? 'Unknown'}`
    }),
  }
}

export const VaultsSearchFilter = () => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const { tabId } = useParams<{ tabId: string }>()

  const { changeLoansSubscriptionsList, marketsAddresses, marketsMapper } = useLoansContext()
  const { tokensMetadata } = useTokensContext()

  const { preparedCollateralAssets, preparedLoanAssets } = useMemo(
    () => prepareFilterBasedOnMatkets(marketsAddresses, marketsMapper, tokensMetadata),
    [marketsAddresses, marketsMapper, tokensMetadata],
  )

  const preparedAssets = [ALL_VAULTS_FILTER].concat(preparedCollateralAssets).concat(preparedLoanAssets)

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

    if (searchQuery !== '') {
      console.log(searchQuery, '----')
    }

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

    applyFilters(updatedChosenDdItem, searchInputValue)
  }

  const applyFilters = useCallback(
    async (filtersList: Filters, searchString: string) => {
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

  return (
    <VaultsSearchFilterWrapper>
      <VaultsSearchFilterStyled>
        <Input
          type="text"
          kind={'search'}
          placeholder="Search by address"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            applyFilters(
              {
                sort,
                assets,
                zero,
              } as Filters,
              e.target.value,
            )
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
      <div className="checkbox-wrapper">
        <Checkbox
          id="vaults-zero-filter"
          onChangeHandler={handleClickCheckbox}
          checked={chosenDdItem[vaultsFilters.ZERO] === 'checked'}
        >
          Hide vaults with a loan balance of 0
        </Checkbox>
      </div>
    </VaultsSearchFilterWrapper>
  )
}

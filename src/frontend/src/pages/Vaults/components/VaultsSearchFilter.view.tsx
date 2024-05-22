import { useEffect, useState, useCallback, useMemo } from 'react'
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
  COLLATERAL_NAME,
  BORROWED_NAME,
  ALL_VAULTS_FILTER,
} from '../Vaults.consts'
import { stringFullCharsCompare } from 'utils/stringFullCharsCompare'

// types
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getVaultCollateralBalance, sortVaultsByStatus } from 'providers/VaultsProvider/helpers/vaults.utils'
import { VaultType } from 'providers/VaultsProvider/vaults.provider.types'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

type Filters = Record<string, string>

type Props = {
  vaultsMapper: Record<string, VaultType>
  allVaultsIds: string[]
  currentVaultsIds: string[]
  setVaultsIds: (arg: string[]) => void
}

// TODO: need to refactor filters logic
export const VaultsSearchFilter = ({ vaultsMapper, allVaultsIds, currentVaultsIds, setVaultsIds }: Props) => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const { tabId } = useParams<{ tabId: string }>()

  const { tokensMetadata, tokensPrices } = useTokensContext()

  // use MOST_RECENT and ALL_VAULTS_FILTER as the default filters value
  const {
    sort = sortVaultItems.MOST_RECENT,
    assets = ALL_VAULTS_FILTER,
    zero = '',
    ...restQP
  } = qs.parse(search, { ignoreQueryPrefix: true })

  const { preparedCollateralAssets, preparedLoanAssets } = useMemo(() => {
    const { collateralAssets, loanAssets } = currentVaultsIds.reduce<{
      collateralAssets: Set<string>
      loanAssets: Set<string>
    }>(
      (acc, vaultAddress) => {
        const { borrowedTokenAddress, collateralData } = vaultsMapper[vaultAddress]

        const loanToken = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata })
        if (!loanToken) return acc

        acc.loanAssets.add(`${BORROWED_NAME}, ${loanToken.symbol}`)

        Array.from({ length: collateralData.length }, (_, idx) => {
          const collateral = getTokenDataByAddress({ tokenAddress: collateralData[idx].tokenAddress, tokensMetadata })
          if (collateral) {
            acc.collateralAssets.add(`${COLLATERAL_NAME}, ${collateral.symbol}`)
          }
        })

        return acc
      },
      {
        collateralAssets: new Set(),
        loanAssets: new Set(),
      },
    )

    return { preparedCollateralAssets: Array.from(collateralAssets), preparedLoanAssets: Array.from(loanAssets) }
  }, [currentVaultsIds, tokensMetadata, vaultsMapper])

  const preparedAssets = [ALL_VAULTS_FILTER].concat(preparedCollateralAssets).concat(preparedLoanAssets)

  const filterDdItems = useMemo(() => preparedAssets.map((item) => getDdItem(item)), [preparedAssets])
  const sortDdItems = useMemo(() => sortingList.map((item) => getDdItem(item)), [])

  const [searchInputValue, setSearchInput] = useState('')

  console.log({ searchInputValue })

  const [filterStatuses, setFilterStatuses] = useState<{ [key: string]: boolean }>({})
  const [chosenDdItem, setChosenDdItem] = useState<Filters>({
    [vaultsFilters.ASSETS]: ALL_VAULTS_FILTER,
    [vaultsFilters.SORT]: sortVaultItems.MOST_RECENT,
  })

  const handleSearch = (searchValue: string, searchData: string[]) => {
    const searchQuery = searchValue.toLowerCase()

    let filteredVaultsIds: string[] = []

    if (searchQuery !== '') {
      filteredVaultsIds = searchData.filter((vaultId) => {
        const vault = vaultsMapper[vaultId]
        const isIncludedInLoanAddress = vault.address.toLowerCase().includes(searchQuery)
        const isIncludedInOwnerAddress = vault.ownerAddress.toLowerCase().includes(searchQuery)

        return isIncludedInLoanAddress || isIncludedInOwnerAddress
      })
    } else {
      filteredVaultsIds = searchData
    }

    setSearchInput(searchValue)

    return filteredVaultsIds
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
      const data = handleSearch(searchString, currentVaultsIds)
      let filteredVaultsIds: string[] = data

      // sort by statuses
      if (filtersList[vaultsFilters.SORT] === sortVaultItems.STATUSES) {
        filteredVaultsIds = await sortVaultsByStatus({
          vaultsIds: data,
          vaultsMapper,
          tokensMetadata,
          tokensPrices,
        })
      }

      const sortIsCollateralHighToLow = filtersList[vaultsFilters.SORT] === sortVaultItems.COLLATERAL_HIGH
      const sortIsCollateralLowToHigh = filtersList[vaultsFilters.SORT] === sortVaultItems.COLLATERAL_LOW
      const sortIsBorrowedAmountHighToLow = filtersList[vaultsFilters.SORT] === sortVaultItems.BORROWED_HIGH
      const sortIsBorrowedAmountLowToHigh = filtersList[vaultsFilters.SORT] === sortVaultItems.BORROWED_LOW
      const sortIsMostRecent = filtersList[vaultsFilters.SORT] === sortVaultItems.MOST_RECENT

      // sort by: collateral value | borrowed amount | date
      if (
        sortIsCollateralHighToLow ||
        sortIsCollateralLowToHigh ||
        sortIsBorrowedAmountHighToLow ||
        sortIsBorrowedAmountLowToHigh ||
        sortIsMostRecent
      ) {
        filteredVaultsIds = data.sort((a, b) => {
          // by collateral amount high > low
          if (sortIsCollateralHighToLow) {
            const vaultA = getVaultCollateralBalance(vaultsMapper[a].collateralData, tokensMetadata, tokensPrices)
            const vaultB = getVaultCollateralBalance(vaultsMapper[b].collateralData, tokensMetadata, tokensPrices)

            return vaultB - vaultA
          }
          // by collateral amount low > high
          if (sortIsCollateralLowToHigh) {
            const vaultA = getVaultCollateralBalance(vaultsMapper[a].collateralData, tokensMetadata, tokensPrices)
            const vaultB = getVaultCollateralBalance(vaultsMapper[b].collateralData, tokensMetadata, tokensPrices)

            return vaultA - vaultB
          }
          // by borrowed amount high > low
          if (sortIsBorrowedAmountHighToLow) {
            const vaultA = vaultsMapper[a].borrowedAmount
            const vaultB = vaultsMapper[b].borrowedAmount

            return vaultB - vaultA
          }

          // by borrowed amount low > high
          if (sortIsBorrowedAmountLowToHigh) {
            const vaultA = vaultsMapper[a].borrowedAmount
            const vaultB = vaultsMapper[b].borrowedAmount

            return vaultA - vaultB
          }
          // by date
          if (sortIsMostRecent) {
            const vaultA = vaultsMapper[a].creationTimestamp
            const vaultB = vaultsMapper[b].creationTimestamp

            if (!vaultA || !vaultB) {
              return 0
            }

            return new Date(vaultB).getTime() - new Date(vaultA).getTime()
          }

          return 0
        })
      }

      const asset = filtersList[vaultsFilters.ASSETS]?.split(',') || []
      const [assetName = '', assetIcon = ''] = asset
      const isCollateralAsset = assetName === COLLATERAL_NAME

      // filter by collateral asset
      if (filtersList[vaultsFilters.ASSETS] && isCollateralAsset && assetIcon) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const vault = vaultsMapper[vaultId]
          if (vault.collateralData.length) {
            const isFound = vault.collateralData.some(({ tokenAddress }) => {
              // TODO: test it
              return stringFullCharsCompare(tokensMetadata[tokenAddress].symbol, assetIcon)
            })

            return isFound
          }

          return false
        })
      }

      // filter by loan asset
      if (filtersList[vaultsFilters.ASSETS] && !isCollateralAsset && assetIcon) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const vault = vaultsMapper[vaultId]
          if (vault.borrowedTokenAddress) {
            // TODO: test it
            return stringFullCharsCompare(tokensMetadata[vault.borrowedTokenAddress].symbol, assetIcon)
          }

          return false
        })
      }

      // filter by 0 balance
      if (filtersList[vaultsFilters.ZERO]) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const { borrowedAmount, collateralData } = vaultsMapper[vaultId]
          return borrowedAmount || getVaultCollateralBalance(collateralData, tokensMetadata, tokensPrices)
        })
      }

      const withoutEmptyFilters = Object.fromEntries(Object.entries(filtersList).filter((item) => item[1]))
      const stringifiedQP = qs.stringify({ ...withoutEmptyFilters, ...restQP })

      navigate(`${vaultsPathname}/${tabId}?${stringifiedQP}`, { replace: true })

      setChosenDdItem(withoutEmptyFilters)
      setVaultsIds(filteredVaultsIds)
    },
    [currentVaultsIds.join(','), restQP, tabId, vaultsMapper, tokensMetadata, tokensPrices],
  )

  const handleClickCheckbox = () => {
    const status = filterStatuses[vaultsFilters.ZERO] ? '' : 'checked'
    handleDropdownSelect(vaultsFilters.ZERO)(status)
  }

  // apply filter to new data or clean data
  useEffect(() => {
    if (currentVaultsIds.length === 0) {
      setVaultsIds([])
      return
    }

    const filtersFromQp = {
      sort,
      assets,
      zero,
    } as Filters

    applyFilters(filtersFromQp, searchInputValue)
  }, [currentVaultsIds.join(',')])

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

import { useEffect, useState, useCallback } from 'react'
import qs from 'qs'
import { useHistory, useLocation, useParams } from 'react-router-dom'

// components
import { Input } from 'app/App.components/Input/Input.controller'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'

// styles
import { VaultsSearchFilterStyled, VaultsSearchFilterWrapper, VaultsFilters } from './../Vaults.style'

// helpers
import { sortByVaultCategory } from '../Vaults.helpers'
import {
  sortVaultItems,
  sortingList,
  vaultsPathname,
  vaultsFilters,
  COLLATERAL_NAME,
  LOAN_NAME,
} from '../Vaults.consts'
import { stringFullCharsCompare } from 'utils/stringFullCharsCompare'

// types
import { VaultType } from 'utils/TypesAndInterfaces/Vaults'

type Filters = Record<string, string>
type AssetCategory = 'loanAssets' | 'collateralAssets'

type Props = {
  assets: Record<AssetCategory, string[]>
  vaultsMapper: Record<string, VaultType>
  currentVaultsIds: string[]
  setVaultsIds: (arg: string[]) => void
}

export const VaultsSearchFilter = ({ assets: assetSymbols, vaultsMapper, currentVaultsIds, setVaultsIds }: Props) => {
  const history = useHistory()
  const { search } = useLocation()
  const { tabId } = useParams<{ tabId: string }>()

  // use MOST_RECENT as the default sorting value
  const {
    sort = sortVaultItems.MOST_RECENT,
    assets = '',
    zero = '',
    ...restQP
  } = qs.parse(search, { ignoreQueryPrefix: true })

  const preparedCollateralAssets = assetSymbols.collateralAssets.map((asset) => `${COLLATERAL_NAME}, ${asset}`)
  const preparedLoanAssets = assetSymbols.loanAssets.map((asset) => `${LOAN_NAME}, ${asset}`)
  const preparedAssets = preparedCollateralAssets.concat(preparedLoanAssets)

  const [searchInputValue, setSearchInput] = useState('')

  const [filterStatuses, setFilterStatuses] = useState<{ [key: string]: boolean }>({})
  const [chosenDdItem, setChosenDdItem] = useState<Filters>({})

  const [filteredData, setFilteredData] = useState<string[]>([])
  const [searchedData, setSearchedData] = useState<string[]>([])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const data = Object.values(chosenDdItem).length ? filteredData : currentVaultsIds

    const searchQuery = e.target.value.toLowerCase()

    let filteredVaultsIds: string[] = []

    if (searchQuery !== '') {
      filteredVaultsIds = data.filter((vaultId) => {
        const vault = vaultsMapper[vaultId]
        const isIncludedInLoanAddress = vault.address.toLowerCase().includes(searchQuery)
        const isIncludedInOwnerAddress = vault.ownerId.toLowerCase().includes(searchQuery)

        return isIncludedInLoanAddress || isIncludedInOwnerAddress
      })
    } else {
      filteredVaultsIds = data
    }

    setSearchInput(e.target.value)
    setSearchedData(filteredVaultsIds)
    setVaultsIds(filteredVaultsIds)
  }

  const handleDropdownSelect = (name: string) => (selectedOption: string) => {
    setFilterStatuses((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))

    let updatedChosenDdItem = {
      ...chosenDdItem,
      [name]: selectedOption,
    }

    if (selectedOption === chosenDdItem[name]) return

    applyFilters(updatedChosenDdItem)
  }

  const applyFilters = useCallback(
    (filtersList: Filters) => {
      const data = searchInputValue ? [...searchedData] : [...currentVaultsIds]
      let filteredVaultsIds: string[] = data

      // sort by statuses
      if (filtersList[vaultsFilters.SORT] === sortVaultItems.STATUSES) {
        filteredVaultsIds = sortByVaultCategory({
          vaultsIds: data,
          vaultsMapper,
          status: filtersList[vaultsFilters.SORT],
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
            const vaultA = vaultsMapper[a].collateralBalance
            const vaultB = vaultsMapper[b].collateralBalance

            return vaultB - vaultA
          }
          // by collateral amount low > high
          if (sortIsCollateralLowToHigh) {
            const vaultA = vaultsMapper[a].collateralBalance
            const vaultB = vaultsMapper[b].collateralBalance

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
      if (filtersList[vaultsFilters.ASSETS] && isCollateralAsset) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const vault = vaultsMapper[vaultId]
          if (vault.collateralData.length) {
            const isFound = vault.collateralData.some(({ symbol }) => {
              return stringFullCharsCompare(symbol, assetIcon)
            })

            return isFound
          }

          return false
        })
      }

      // filter by loan asset
      if (filtersList[vaultsFilters.ASSETS] && !isCollateralAsset) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const vault = vaultsMapper[vaultId]
          if (vault.borrowedAsset.symbol) {
            return stringFullCharsCompare(vault.borrowedAsset.symbol, assetIcon)
          }

          return false
        })
      }

      // filter by 0 balance
      if (filtersList[vaultsFilters.ZERO]) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const { borrowedAmount, collateralBalance } = vaultsMapper[vaultId]
          return borrowedAmount || collateralBalance
        })
      }

      const withoutEmptyFilters = Object.fromEntries(Object.entries(filtersList).filter((item) => item[1]))
      const stringifiedQP = qs.stringify({ ...withoutEmptyFilters, ...restQP })

      history.replace(`${vaultsPathname}/${tabId}?${stringifiedQP}`)

      setChosenDdItem(withoutEmptyFilters)
      setFilteredData(filteredVaultsIds)
      setVaultsIds(filteredVaultsIds)
    },
    [currentVaultsIds, history, restQP, searchInputValue, searchedData, setVaultsIds, tabId, vaultsMapper],
  )

  const handleDropdownStatus = (name: string) => (status: boolean) => {
    setFilterStatuses((prev) => ({
      ...prev,
      [name]: status,
    }))
  }

  const handleClickCheckbox = () => {
    const status = filterStatuses[vaultsFilters.ZERO] ? '' : 'checked'
    handleDropdownSelect(vaultsFilters.ZERO)(status)
  }

  useEffect(() => {
    // clear query after switching tab
    setChosenDdItem({})
  }, [tabId])

  useEffect(() => {
    if (currentVaultsIds.length) {
      const filtersFromQp = {
        sort,
        assets,
        zero,
      } as Filters

      applyFilters(filtersFromQp)
    }
  }, [currentVaultsIds])

  return (
    <VaultsSearchFilterWrapper>
      <VaultsSearchFilterStyled>
        <Input
          type="text"
          kind={'search'}
          placeholder="Search by address"
          onChange={handleSearch}
          value={searchInputValue}
        />
        <VaultsFilters>
          <div className="filter">
            <h4>Filter by:</h4>
            <DropDown
              className="assetsFilter"
              placeholder="Default of All Assets"
              isOpen={filterStatuses[vaultsFilters.ASSETS]}
              setIsOpen={handleDropdownStatus(vaultsFilters.ASSETS)}
              itemSelected={chosenDdItem[vaultsFilters.ASSETS]}
              items={preparedAssets}
              clickOnItem={handleDropdownSelect(vaultsFilters.ASSETS)}
            />
          </div>

          <div className="filter">
            <h4>Order by:</h4>
            {/* TODO: replace to new dd */}
            <DropDown
              placeholder={sortVaultItems.MOST_RECENT}
              isOpen={filterStatuses[vaultsFilters.SORT]}
              setIsOpen={handleDropdownStatus(vaultsFilters.SORT)}
              itemSelected={chosenDdItem[vaultsFilters.SORT]}
              items={sortingList}
              clickOnItem={handleDropdownSelect(vaultsFilters.SORT)}
            />
          </div>
        </VaultsFilters>
      </VaultsSearchFilterStyled>
      <Checkbox
        id="show_dropped"
        onChangeHandler={handleClickCheckbox}
        checked={chosenDdItem[vaultsFilters.ZERO] === 'checked'}
        className="checkbox"
      >
        <span>Hide vaults with a loan balance of 0</span>
      </Checkbox>
    </VaultsSearchFilterWrapper>
  )
}

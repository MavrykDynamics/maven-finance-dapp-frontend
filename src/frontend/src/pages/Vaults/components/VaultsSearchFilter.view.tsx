import { useEffect, useState, useCallback } from 'react'
import qs from 'qs'
import { useHistory, useLocation, useParams } from 'react-router-dom'

// components
import { Input } from 'app/App.components/Input/Input.controller'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'

// styles
import { VaultsSearchFilterStyled, VaultsSearchFilterWrapper } from './../Vaults.style'

// helpers
import { sortByVaultCategory } from '../Vaults.helpers'
import { sortVaultItems } from '../Vaults.consts'

// types
import { VaultType } from 'utils/TypesAndInterfaces/Vaults'

const pathname = '/vaults'

const filters = {
  SORT: 'sort',
  COLLATERAL: 'collateral',
  LOAN: 'loan',
  ZERO: 'zero',
}

type Filters = Record<string, string>

const sortingList = Object.values(sortVaultItems)

type AssetCategory = 'loanAssets' | 'collateralAssets'

type Props = {
  assets: Record<AssetCategory, string[]>
  vaultsMapper: Record<string, VaultType>
  currentVaultsIds: string[]
  setVaultsIds: (arg: string[]) => void
}

export const VaultsSearchFilter = ({ assets, vaultsMapper, currentVaultsIds, setVaultsIds }: Props) => {
  const history = useHistory()
  const { search } = useLocation()
  const { tabId } = useParams<{ tabId: string }>()
  const { sort = '', collateral = '', loan = '', zero = '', ...restQP } = qs.parse(search, { ignoreQueryPrefix: true })

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

        const isFoundCollateralAsset = vault.collateralData.some(({ symbol }) => {
          return symbol?.toLowerCase().includes(searchQuery)
        })

        if (
          vault.address.toLowerCase().includes(searchQuery) ||
          vault.borrowedAsset.symbol?.toLowerCase().includes(searchQuery) ||
          isFoundCollateralAsset
        ) {
          return true
        }

        return false
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
      if (filtersList[filters.SORT] === sortVaultItems.STATUSES) {
        filteredVaultsIds = sortByVaultCategory({
          vaultsIds: data,
          vaultsMapper,
          status: filtersList[filters.SORT],
        })
      }

      const sortIsCollateralValue = filtersList[filters.SORT] === sortVaultItems.COLLATERAL_VALUE
      const sortIsBorrowedAmount = filtersList[filters.SORT] === sortVaultItems.BORROWED_AMOUNT
      const sortIsMostRecent = filtersList[filters.SORT] === sortVaultItems.MOST_RECENT

      // sort by: collateral value | borrowed amount | date
      if (sortIsCollateralValue || sortIsBorrowedAmount || sortIsMostRecent) {
        filteredVaultsIds = data.sort((a, b) => {
          // by collateral value
          if (sortIsCollateralValue) {
            const vaultA = vaultsMapper[a].collateralBalance
            const vaultB = vaultsMapper[b].collateralBalance

            return vaultB - vaultA
            // by borrowed amount
          }
          if (sortIsBorrowedAmount) {
            const vaultA = vaultsMapper[a].borrowedAmount
            const vaultB = vaultsMapper[b].borrowedAmount

            return vaultB - vaultA
            // by date
          }
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

      // filter by collateral asset
      if (filtersList[filters.COLLATERAL]) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const vault = vaultsMapper[vaultId]
          if (vault.collateralData.length) {
            const isFound = vault.collateralData.some(({ symbol }) => {
              return symbol?.toLowerCase() === filtersList[filters.COLLATERAL].toLowerCase()
            })

            return isFound
          }

          return false
        })
      }

      // filter by loan asset
      if (filtersList[filters.LOAN]) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const vault = vaultsMapper[vaultId]
          if (vault.borrowedAsset.symbol) {
            const isFound = vault.borrowedAsset.symbol?.toLowerCase() === filtersList[filters.LOAN].toLowerCase()

            return isFound
          }

          return false
        })
      }

      // filter by 0 balance
      if (filtersList[filters.ZERO]) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const { borrowedAmount, collateralBalance } = vaultsMapper[vaultId]
          return borrowedAmount || collateralBalance
        })
      }

      const withoutEmptyFilters = Object.fromEntries(Object.entries(filtersList).filter((item) => item[1]))
      const stringifiedQP = qs.stringify({ ...withoutEmptyFilters, ...restQP })

      history.replace(`${pathname}/${tabId}?${stringifiedQP}`)

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
    const status = filterStatuses[filters.ZERO] ? '' : 'checked'
    handleDropdownSelect(filters.ZERO)(status)
  }

  useEffect(() => {
    // clear query after switching tab
    setChosenDdItem({})
  }, [tabId])

  useEffect(() => {
    if (currentVaultsIds.length) {
      const filtersFromQp = {
        sort,
        collateral,
        loan,
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
          placeholder="Search by..."
          onChange={handleSearch}
          value={searchInputValue}
        />
        <DropdownContainer className="dd-container">
          <h4>Order by:</h4>

          <DropDown
            className="dd-item"
            placeholder="Sort"
            isOpen={filterStatuses[filters.SORT]}
            setIsOpen={handleDropdownStatus(filters.SORT)}
            itemSelected={chosenDdItem[filters.SORT]}
            items={sortingList}
            clickOnItem={handleDropdownSelect(filters.SORT)}
          />

          <DropDown
            className="dd-item"
            placeholder="Сollateral Asset"
            isOpen={filterStatuses[filters.COLLATERAL]}
            setIsOpen={handleDropdownStatus(filters.COLLATERAL)}
            itemSelected={chosenDdItem[filters.COLLATERAL]}
            items={assets.collateralAssets}
            clickOnItem={handleDropdownSelect(filters.COLLATERAL)}
          />

          <DropDown
            className="dd-item"
            placeholder="Loan Asset"
            isOpen={filterStatuses[filters.LOAN]}
            setIsOpen={handleDropdownStatus(filters.LOAN)}
            itemSelected={chosenDdItem[filters.LOAN]}
            items={assets.loanAssets}
            clickOnItem={handleDropdownSelect(filters.LOAN)}
          />
        </DropdownContainer>
      </VaultsSearchFilterStyled>
      <Checkbox
        id="show_dropped"
        onChangeHandler={handleClickCheckbox}
        checked={chosenDdItem[filters.ZERO] === 'checked'}
        className="checkbox"
      >
        <span>Hide vaults with a loan balance of 0</span>
      </Checkbox>
    </VaultsSearchFilterWrapper>
  )
}

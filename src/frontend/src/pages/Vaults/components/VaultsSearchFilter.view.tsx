import { useState } from 'react'

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

const filters = {
  SORT: 'SORT',
  COLLATERAL: 'COLLATERAL',
  LOAN: 'LOAN',
  ZERO: 'ZERO',
}

const sortingList = Object.values(sortVaultItems)

type AssetCategory = 'loanAssets' | 'collateralAssets'

type Props = {
  assets: Record<AssetCategory, string[]>
  vaultsMapper: Record<string, VaultType>
  allVaultsIds: string[]
  setVaultsIds: (arg: string[]) => void
}

export const VaultsSearchFilter = ({ assets, vaultsMapper, allVaultsIds, setVaultsIds }: Props) => {
  const [searchInputValue, setSearchInput] = useState('')

  const [filterStatuses, setFilterStatuses] = useState<{ [key: string]: boolean }>({})
  const [chosenDdItem, setChosenDdItem] = useState<{ [key: string]: string }>({})

  const [filteredData, setFilteredData] = useState<string[]>([])
  const [searchedData, setSearchedData] = useState<string[]>([])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const data = Object.values(chosenDdItem).length ? filteredData : allVaultsIds

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

    setChosenDdItem(updatedChosenDdItem)

    if (selectedOption !== chosenDdItem[name]) {
      const data = searchInputValue ? [...searchedData] : [...allVaultsIds]
      let filteredVaultsIds: string[] = data

      // sort by statuses
      if (updatedChosenDdItem[filters.SORT] === sortVaultItems.STATUSES) {
        filteredVaultsIds = sortByVaultCategory({
          vaultsIds: data,
          vaultsMapper,
          status: updatedChosenDdItem[filters.SORT],
        })
      }

      const sortIsCollateralValue = updatedChosenDdItem[filters.SORT] === sortVaultItems.COLLATERAL_VALUE
      const sortIsBorrowedAmount = updatedChosenDdItem[filters.SORT] === sortVaultItems.BORROWED_AMOUNT
      const sortIsMostRecent = updatedChosenDdItem[filters.SORT] === sortVaultItems.MOST_RECENT

      // sort by: collateral value | borrowed amount | date
      if (sortIsCollateralValue || sortIsBorrowedAmount || sortIsMostRecent) {
        filteredVaultsIds = data.sort((a, b) => {
          // by collateral value
          if (sortIsCollateralValue) {
            const vaultA = vaultsMapper[a].collateralBalance
            const vaultB = vaultsMapper[b].collateralBalance

            return vaultB - vaultA
            // by borrowed amount
          } else if (sortIsBorrowedAmount) {
            const vaultA = vaultsMapper[a].borrowedAmount
            const vaultB = vaultsMapper[b].borrowedAmount

            return vaultB - vaultA
            // by date
          } else if (sortIsMostRecent) {
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
      if (updatedChosenDdItem[filters.COLLATERAL]) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const vault = vaultsMapper[vaultId]

          if (vault.collateralData.length) {
            const isFound = vault.collateralData.some(({ symbol }) => {
              return symbol?.toLowerCase() === updatedChosenDdItem[filters.COLLATERAL].toLowerCase()
            })

            return isFound
          }

          return false
        })
      }

      // filter by loan asset
      if (updatedChosenDdItem[filters.LOAN]) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const vault = vaultsMapper[vaultId]

          if (vault.borrowedAsset.symbol) {
            const isFound =
              vault.borrowedAsset.symbol?.toLowerCase() === updatedChosenDdItem[filters.LOAN].toLowerCase()

            return isFound
          }

          return false
        })
      }

      // filter by 0 balance
      if (updatedChosenDdItem[filters.ZERO]) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const { borrowedAmount, collateralBalance } = vaultsMapper[vaultId]
          return borrowedAmount || collateralBalance
        })
      }

      setFilteredData(filteredVaultsIds)
      setVaultsIds(filteredVaultsIds)
    }
  }

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
        checked={filterStatuses[filters.ZERO]}
        className="checkbox"
      >
        <span>Hide vaults with a balance of 0</span>
      </Checkbox>
    </VaultsSearchFilterWrapper>
  )
}

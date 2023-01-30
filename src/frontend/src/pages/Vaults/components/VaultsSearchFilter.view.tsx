import { useState } from 'react'

// components
import { Input } from 'app/App.components/Input/Input.controller'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'

// styles
import { VaultsSearchFilterStyled } from './../Vaults.style'

// helpers
import { sortByVaultCategory } from '../Vaults.helpers'
import { sortVaultItems } from '../Vaults.consts'

// types
import { VaultType } from 'utils/TypesAndInterfaces/Vaults'

const dropdowns = {
  SORT: 'SORT',
  COLLATERAL: 'COLLATERAL',
  LOAN: 'LOAN',
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

  const [dropdownStatus, setDropdownStatus] = useState<{[key:string]: boolean}>({})
  const [chosenDdItem, setChosenDdItem] = useState<{[key:string]: string}>({})

  const [filteredData, setFilteredData] = useState<string[]>([])
  const [searchedData, setSearchedData] = useState<string[]>([])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const data = Object.values(chosenDdItem).length ? filteredData : allVaultsIds

    const searchQuery = e.target.value.toLowerCase()

    let filteredVaultsIds: string[] = []

    if (searchQuery !== '') {
      filteredVaultsIds = data.filter((vaultId) => {
        const vault = vaultsMapper[vaultId]

        const isFoundCollateralAsset = vault.collateralData.some(({ assetSymbol }) => {
          return assetSymbol?.toLowerCase().includes(searchQuery)
        })

        if (
          vault.address.toLowerCase().includes(searchQuery) ||
          vault.borrowedAsset.assetSymbol?.toLowerCase().includes(searchQuery) || 
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
    setDropdownStatus((prev) => ({
      ...prev,
      [name]: !prev[name]
    }))

    const updatedChosenDdItem = {
      ...chosenDdItem,
      [name]: selectedOption
    }

    setChosenDdItem(updatedChosenDdItem)

    if (selectedOption !== '' && selectedOption !== chosenDdItem[name]) {
      const data = searchInputValue ? [...searchedData] : [...allVaultsIds]
      let filteredVaultsIds: string[] = data

      // sort by statuses
      if (updatedChosenDdItem[dropdowns.SORT] === sortVaultItems.STATUSES) {
        filteredVaultsIds = sortByVaultCategory({
          vaultsIds: data,
          vaultsMapper,
          status: updatedChosenDdItem[dropdowns.SORT]
        })
      }

      const sortIsCollateralValue = updatedChosenDdItem[dropdowns.SORT] === sortVaultItems.COLLATERAL_VALUE
      const sortIsBorrowedAmount = updatedChosenDdItem[dropdowns.SORT] === sortVaultItems.BORROWED_AMOUNT
      const sortIsMostRecent = updatedChosenDdItem[dropdowns.SORT] === sortVaultItems.MOST_RECENT

      // sort by: collateral value | borrowed amount | date
      if (sortIsCollateralValue || sortIsBorrowedAmount || sortIsMostRecent) {
        filteredVaultsIds = data.sort((a, b) => {

          // by collateral value
          if (sortIsCollateralValue) {
            const vaultA = vaultsMapper[a].borrowedAsset.collateralBalance
            const vaultB = vaultsMapper[b].borrowedAsset.collateralBalance
  
            return vaultB - vaultA
          // by borrowed amount
          } else if (sortIsBorrowedAmount) {
            const vaultA = vaultsMapper[a].borrowedAsset.amtBorrowed
            const vaultB = vaultsMapper[b].borrowedAsset.amtBorrowed
  
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
      if (updatedChosenDdItem[dropdowns.COLLATERAL]) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const vault = vaultsMapper[vaultId]
  
          if (vault.collateralData.length) {
            const isFound = vault.collateralData.some(({ assetSymbol }) => {
              return assetSymbol?.toLowerCase() === updatedChosenDdItem[dropdowns.COLLATERAL].toLowerCase()
            })
  
            return isFound
          }
  
          return false
        })
      }

      // filter by loan asset
      if (updatedChosenDdItem[dropdowns.LOAN]) {
        filteredVaultsIds = filteredVaultsIds.filter((vaultId) => {
          const vault = vaultsMapper[vaultId]

          if (vault.borrowedAsset.assetSymbol) {
            const isFound = vault.borrowedAsset.assetSymbol?.toLowerCase() === updatedChosenDdItem[dropdowns.LOAN].toLowerCase()
  
            return isFound
          }
  
          return false
        })
      }
  
      setFilteredData(filteredVaultsIds)
      setVaultsIds(filteredVaultsIds)
    }
  }

  const handleDropdownStatus = (name: string) => (status: boolean) => {
    setDropdownStatus((prev) => ({
      ...prev,
      [name]: status
    }))
  }

  return (
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
          isOpen={dropdownStatus[dropdowns.SORT]}
          setIsOpen={handleDropdownStatus(dropdowns.SORT)}
          itemSelected={chosenDdItem[dropdowns.SORT]}
          items={sortingList}
          clickOnItem={handleDropdownSelect(dropdowns.SORT)}
        />

        <DropDown
          className="dd-item"
          placeholder="Сollateral Asset"
          isOpen={dropdownStatus[dropdowns.COLLATERAL]}
          setIsOpen={handleDropdownStatus(dropdowns.COLLATERAL)}
          itemSelected={chosenDdItem[dropdowns.COLLATERAL]}
          items={assets.collateralAssets}
          clickOnItem={handleDropdownSelect(dropdowns.COLLATERAL)}
        />

        <DropDown
          className="dd-item"
          placeholder="Loan Asset"
          isOpen={dropdownStatus[dropdowns.LOAN]}
          setIsOpen={handleDropdownStatus(dropdowns.LOAN)}
          itemSelected={chosenDdItem[dropdowns.LOAN]}
          items={assets.loanAssets}
          clickOnItem={handleDropdownSelect(dropdowns.LOAN)}
        />
      </DropdownContainer>
    </VaultsSearchFilterStyled>
  )
}

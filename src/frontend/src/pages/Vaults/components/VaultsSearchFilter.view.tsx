import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// components
import { Input } from 'app/App.components/Input/Input.controller'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'

// styles
import { VaultsSearchFilterStyled } from './../Vaults.style'

// helpers
import { sortByCategory } from 'utils/sortByCategory'

// types
import { State } from '../../../reducers'
import { VaultType } from 'utils/TypesAndInterfaces/Vaults'

const dropdowns = {
  STATUSES: 'STATUSES',
  COLLATERAL: 'COLLATERAL',
  LOAN: 'LOAN',
}

type AssetCategory = 'loanAssets' | 'collateralAssets'

type Props = {
  statuses: string[]
  assets: Record<AssetCategory, string[]>
  vaultsMapper: Record<string, VaultType>
  allVaultIds: string[]
  setVaultIds: (arg: string[]) => void
}

export const VaultsSearchFilter = ({ statuses, assets, vaultsMapper, allVaultIds, setVaultIds }: Props) => {
  const dispatch = useDispatch()
  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  const [searchInputValue, setSearchInput] = useState('')

  const [dropdownStatus, setDropdownStatus] = useState<{[key:string]: boolean}>({})
  const [chosenDdItem, setChosenDdItem] = useState<{[key:string]: string}>({})

  // TODO: should work with selected filters
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value.toLowerCase()

    let filteredVaultIds: string[] = []

    if (searchQuery !== '') {
      filteredVaultIds = allVaultIds.filter((vaultId) => {
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
      filteredVaultIds = allVaultIds
    }

    setSearchInput(e.target.value)
    setVaultIds(filteredVaultIds)
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
      let filteredVaultIds: string[] = [...allVaultIds]

      // filter by collateral asset
      if (updatedChosenDdItem[dropdowns.COLLATERAL]) {
        filteredVaultIds = allVaultIds.filter((vaultId) => {
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
        filteredVaultIds = filteredVaultIds.filter((vaultId) => {
          const vault = vaultsMapper[vaultId]

          if (vault.borrowedAsset.assetSymbol) {
            const isFound = vault.borrowedAsset.assetSymbol?.toLowerCase() === updatedChosenDdItem[dropdowns.LOAN].toLowerCase()
  
            return isFound
          }
  
          return false
        })
      }
  
      setVaultIds(filteredVaultIds)
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
          placeholder="Statuses"
          isOpen={dropdownStatus[dropdowns.STATUSES]}
          setIsOpen={handleDropdownStatus(dropdowns.STATUSES)}
          itemSelected={chosenDdItem[dropdowns.STATUSES]}
          items={statuses}
          clickOnItem={handleDropdownSelect(dropdowns.STATUSES)}
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

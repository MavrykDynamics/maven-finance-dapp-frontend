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

const dropdowns = {
  STATUSES: 'STATUSES',
  COLLATERAL: 'COLLATERAL',
  LOAN: 'LOAN',
}

type AssetCategory = 'loanAssets' | 'collateralAssets'

type Props = {
  statuses: string[]
  assets: Record<AssetCategory, string[]>
}

export const VaultsSearchFilter = ({ statuses, assets }: Props) => {
  const dispatch = useDispatch()
  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  const [searchInputValue, setSearchInput] = useState('')
  const [sortedData, setSortedData] = useState<unknown[]>([])

  const [dropdownStatus, setDropdownStatus] = useState<{[key:string]: boolean}>({})
  const [chosenDdItem, setChosenDdItem] = useState<{[key:string]: string}>({})

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value
  
    let searchResult: unknown[] = []

    if (searchQuery !== '') {
      searchResult = []
    } else {
      searchResult = []
    }

    setSearchInput(e.target.value)
    setSortedData(searchResult)
  }

  const handleDropdownSelect = (name: string) => (selectedOption: string) => {
    setDropdownStatus((prev) => ({
      ...prev,
      [name]: !prev[name]
    }))

    setChosenDdItem((prev) => ({
      ...prev,
      [name]: selectedOption
    }))

    if (selectedOption !== '' && selectedOption !== chosenDdItem[name]) {
      setSortedData((data: unknown[]) => {
        // return sortByCategory(data, selectedOption)
        return data
      })
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

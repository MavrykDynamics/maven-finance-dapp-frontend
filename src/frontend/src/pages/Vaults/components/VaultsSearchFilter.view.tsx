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
  statuses: 'STATUSES',
  sizes: 'SIZES',
  assets: 'ASSETS',
}

export const VaultsSearchFilter = () => {
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
        placeholder="Search data feed..."
        onChange={handleSearch}
        value={searchInputValue}
      />

      <DropdownContainer className="dd-container">
        <h4>Order by:</h4>

        <DropDown
          className="dd-item"
          placeholder="Statuses"
          isOpen={dropdownStatus[dropdowns.statuses]}
          setIsOpen={handleDropdownStatus(dropdowns.statuses)}
          itemSelected={chosenDdItem[dropdowns.statuses]}
          items={['one st', 'two st']}
          clickOnItem={handleDropdownSelect(dropdowns.statuses)}
        />

        <DropDown
          className="dd-item"
          placeholder="All Sizes"
          isOpen={dropdownStatus[dropdowns.sizes]}
          setIsOpen={handleDropdownStatus(dropdowns.sizes)}
          itemSelected={chosenDdItem[dropdowns.sizes]}
          items={['one size', 'two size']}
          clickOnItem={handleDropdownSelect(dropdowns.sizes)}
        />

        <DropDown
          className="dd-item"
          placeholder="All Assets"
          isOpen={dropdownStatus[dropdowns.assets]}
          setIsOpen={handleDropdownStatus(dropdowns.assets)}
          itemSelected={chosenDdItem[dropdowns.assets]}
          items={['one asset', 'two asset']}
          clickOnItem={handleDropdownSelect(dropdowns.assets)}
        />
      </DropdownContainer>
    </VaultsSearchFilterStyled>
  )
}

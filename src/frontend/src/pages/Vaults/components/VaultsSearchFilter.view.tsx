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

export const VaultsSearchFilter = () => {
  const dispatch = useDispatch()
  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  const [searchInputValue, setSearchInput] = useState('')
  const [sortedData, setSortedData] = useState<unknown[]>([])
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<string | undefined>()

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

  const handleSelect = (selectedOption: string) => {
    setDdIsOpen(!ddIsOpen)
    setChosenDdItem(selectedOption)

    if (selectedOption !== '' && selectedOption !== chosenDdItem) {
      setSortedData((data: unknown[]) => {
        // return sortByCategory(data, selectedOption)
        return data
      })
    }
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
          isOpen={ddIsOpen}
          setIsOpen={setDdIsOpen}
          itemSelected={chosenDdItem}
          items={[]}
          clickOnItem={handleSelect}
        />

        <DropDown
          className="dd-item"
          placeholder="All Sizes"
          isOpen={ddIsOpen}
          setIsOpen={setDdIsOpen}
          itemSelected={chosenDdItem}
          items={[]}
          clickOnItem={handleSelect}
        />

        <DropDown
          className="dd-item"
          placeholder="All Assets"
          isOpen={ddIsOpen}
          setIsOpen={setDdIsOpen}
          itemSelected={chosenDdItem}
          items={[]}
          clickOnItem={handleSelect}
        />
      </DropdownContainer>
    </VaultsSearchFilterStyled>
  )
}

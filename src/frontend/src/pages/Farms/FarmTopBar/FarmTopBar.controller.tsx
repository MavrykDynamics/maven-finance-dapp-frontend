import { useMemo, useState } from 'react'

// types, consts
import {
  itemsForFarmsSortDD,
  LIVE_TAB_ID,
  FINISHED_TAB_ID,
  FarmsFiltersStateType,
  FarmsViewVariantType,
  NO_STAKED,
  STAKED,
} from '../Farms.const'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import Toggle from '../../../app/App.components/Toggle/Toggle.view'
import { SlidingTabButtons } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { DropDown, DropdownItemType } from '../../../app/App.components/DropDown/DropDown.controller'
import { HandleClickArgsType } from '../Farms.controller'

// style
import { DropdownContainer } from '../../../app/App.components/DropDown/DropDown.style'
import { FarmTopBarStyled } from './FarmTopBar.style'

export type FarmTopBarViewProps = {
  handleSetFarmsViewVariant: (arg0: FarmsViewVariantType) => void
  className: string
  farmsFilters: FarmsFiltersStateType
  handleFilterClick: (args: HandleClickArgsType) => void
}

export const FarmTopBar = ({
  handleSetFarmsViewVariant,
  className,
  farmsFilters: { isLive, isStaked, searchValue, sortBy },
  handleFilterClick,
}: FarmTopBarViewProps) => {
  const [ddItems, _] = useState(itemsForFarmsSortDD.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>(
    itemsForFarmsSortDD.find((item) => item.value === sortBy),
  )

  const handleOnClickDropdownItem = (e: string) => {
    const chosenItem = itemsForFarmsSortDD.find((item) => item.text === e)
    if (chosenItem) {
      setChosenDdItem(chosenItem)
      setDdIsOpen(!ddIsOpen)
      handleFilterClick({ filterType: 'sort', newSortBy: chosenItem.value })
    }
  }

  const liveFinishedTabs = useMemo(
    () => [
      { text: 'Live', id: LIVE_TAB_ID, active: isLive === LIVE_TAB_ID },
      { text: 'Finished', id: FINISHED_TAB_ID, active: isLive === FINISHED_TAB_ID },
    ],
    [isLive],
  )

  return (
    <FarmTopBarStyled className={className}>
      <Toggle
        checked={isStaked === STAKED}
        onChange={() =>
          handleFilterClick({ filterType: 'isStaked', newStakedValue: isStaked === STAKED ? NO_STAKED : STAKED })
        }
        className="farm-toggle"
        sufix="Staked Only"
      />
      <SlidingTabButtons
        tabItems={liveFinishedTabs}
        className="tab-bar"
        onClick={() =>
          handleFilterClick({
            filterType: 'isLive',
            newLiveFinished: isLive === LIVE_TAB_ID ? FINISHED_TAB_ID : LIVE_TAB_ID,
          })
        }
      />
      <Input
        type="text"
        placeholder="Search by..."
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleFilterClick({
            filterType: 'search',
            newSearchText: e.target.value,
          })
        }
      />
      <DropdownContainer className="order-by">
        <h4>Order by:</h4>
        <DropDown
          placeholder={'Choose order'}
          isOpen={ddIsOpen}
          setIsOpen={setDdIsOpen}
          itemSelected={chosenDdItem?.text}
          items={ddItems}
          clickOnItem={(e) => handleOnClickDropdownItem(e)}
        />
      </DropdownContainer>
      <div className="change-view">
        <button className="btn-horizontal" onClick={() => handleSetFarmsViewVariant('horizontal')}>
          <Icon id="hamburger" />
        </button>
        <button className="btn-vertical" onClick={() => handleSetFarmsViewVariant('vertical')}>
          <Icon id="hamburger" />
        </button>
      </div>
    </FarmTopBarStyled>
  )
}

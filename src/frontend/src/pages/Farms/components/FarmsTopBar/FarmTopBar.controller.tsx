import { useMemo, useState } from 'react'
import classNames from 'classnames'

// types
import { FarmsFiltersStateType, FarmsFilterEventType } from 'providers/FarmsProvider/helpers/farms.types'

// consts
import { FINISHED_TAB_ID, LIVE_TAB_ID, NO_STAKED, STAKED } from 'providers/FarmsProvider/helpers/farms.const'
import { BUTTON_SIMPLE_SMALL } from 'app/App.components/Button/Button.constants'

// view
import Icon from '../../../../app/App.components/Icon/Icon.view'
import Toggle from '../../../../app/App.components/Toggle/Toggle.view'
import { SlidingTabButtons } from '../../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { Input } from '../../../../app/App.components/Input/Input.controller'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'
import { DropdownContainer } from '../../../../app/App.components/DropDown/DropDown.style'
import { FarmTopBarStyled } from '../../Farms.style'
import Button from 'app/App.components/Button/NewButton'

const farmsSortDD = [
  { content: 'Active', id: 'active' },
  { content: 'Highest APY', id: 'highestAPY' },
  { content: 'Lowest APY', id: 'lowestAPY' },
  { content: 'Highest Liquidity (LPBalance)', id: 'highestLiquidity' },
  { content: 'Lowest Liquidity (LPBalance)', id: 'lowestLiquidity' },
  { content: 'Your Largest Stake', id: 'yourLargestStake' },
  { content: 'Rewards Per Block', id: 'rewardsPerBlock' },
]

type FarmTopBarViewProps = {
  isVerticalView: boolean
  handleSetFarmsViewVariant: (isVertical: boolean) => void
  handleFilterClick: (args: FarmsFilterEventType) => void
  farmsFilters: FarmsFiltersStateType
}

export const FarmTopBar = ({
  isVerticalView,
  handleSetFarmsViewVariant,
  farmsFilters: { isLive, isStaked, searchValue, sortBy },
  handleFilterClick,
}: FarmTopBarViewProps) => {
  const [chosenDdItem, setChosenDdItem] = useState(farmsSortDD.find((item) => item.id === sortBy))

  const handleOnClickDropdownItem = (itemId: DDItemId) => {
    const chosenItem = farmsSortDD.find((item) => item.id === itemId)
    if (chosenItem) {
      setChosenDdItem(chosenItem)
      handleFilterClick({ filterType: 'sort', newSortBy: chosenItem.id })
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
    <FarmTopBarStyled>
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
          placeholder="Choose order"
          activeItem={chosenDdItem}
          items={farmsSortDD}
          clickItem={handleOnClickDropdownItem}
        />
      </DropdownContainer>

      <div className="change-view">
        <div className={classNames('btn-horizontal', { selected: !isVerticalView })}>
          <Button
            kind={BUTTON_SIMPLE_SMALL}
            onClick={() => handleSetFarmsViewVariant(false)}
            selected={!isVerticalView}
          >
            <Icon id="hamburger" />
          </Button>
        </div>

        <div className={classNames('btn-vertical', { selected: isVerticalView })}>
          <Button kind={BUTTON_SIMPLE_SMALL} onClick={() => handleSetFarmsViewVariant(true)} selected={isVerticalView}>
            <Icon id="hamburger" />
          </Button>
        </div>
      </div>
    </FarmTopBarStyled>
  )
}

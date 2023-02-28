import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'

// view
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'

// action
import { removeCouncilMember } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForm.style'

export const CouncilFormRemoveCouncilMember = () => {
  const dispatch = useDispatch()
  const { councilMembers } = useSelector((state: State) => state.council)

  const dropDownItems = useMemo(
    () =>
      councilMembers.map((item, index) => ({
        content: (
          <div>
            {item.name} - {getShortTzAddress({ tzAddress: item.userId })}
          </div>
        ),
        tzAddress: item.userId,
        id: index,
      })),
    [councilMembers],
  )

  type DropDownItemType = typeof dropDownItems[0]
  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const memberAddress = chosenDdItem?.tzAddress
      if (!memberAddress) return

      await dispatch(removeCouncilMember(memberAddress))
      setChosenDdItem(undefined)
    } catch (error) {
      console.error(error)
    }
  }

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (!foundItem) return
    setChosenDdItem(foundItem)
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Remove Council Member</h1>
      <p>Please enter valid function parameters for removing a council member</p>
      <div className="form-grid form-grid-button-right">
        <div>
          <label>Choose Council Member to remove</label>
          <DropDown
            placeholder="Choose Member Address"
            activeItem={chosenDdItem}
            items={dropDownItems}
            clickItem={handleClickDropdownItem}
          />
        </div>
        <div className="button-aligment">
          <Button text="Remove Council Member" className="plus-btn" kind={'actionPrimary'} icon="minus" type="submit" />
        </div>
      </div>
    </CouncilFormStyled>
  )
}

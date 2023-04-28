import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import { DropDown, DDItemId } from 'app/App.components/DropDown/NewDropdown'
import Icon from '../../../app/App.components/Icon/Icon.view'

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'

// actions
import { removeCouncilMember } from '../BreakGlassCouncil.actions'

export function FormRemoveCouncilMemberView() {
  const dispatch = useDispatch()
  const { breakGlassCouncilMembers } = useSelector((state: State) => state.council)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const dropDownItems = useMemo(
    () =>
      breakGlassCouncilMembers.map((item, index) => ({
        content: (
          <div>
            {item.name} - {getShortTzAddress({ tzAddress: item.userId })}
          </div>
        ),
        tzAddress: item.userId,
        id: index,
      })),
    [breakGlassCouncilMembers],
  )

  type DropDownItemType = (typeof dropDownItems)[0]

  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const memberAddress = chosenDdItem?.tzAddress

    if (!memberAddress) return
    dispatch(removeCouncilMember(memberAddress))

    setChosenDdItem(undefined)
  }

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (!foundItem) return
    setChosenDdItem(foundItem)
  }

  return (
    <FormStyled>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <h1>Remove Council Member</h1>
      <p>Please enter valid function parameters for removing a council member</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>Choose Council Member to remove</label>

          <DropDown
            placeholder="Choose member"
            activeItem={chosenDdItem}
            items={dropDownItems}
            clickItem={handleClickDropdownItem}
          />
        </div>

        <div className="btn-wrapper">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
            <Icon id="minus" />
            Remove Council Member
          </NewButton>
        </div>
      </form>
    </FormStyled>
  )
}

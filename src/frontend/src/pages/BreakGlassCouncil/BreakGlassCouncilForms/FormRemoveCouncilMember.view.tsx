import React, { useState, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
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
import { removeCouncilMember } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// consts
import { REMOVE_BREAK_GLASS_COUNCIL_MEMBER_ACTION } from 'providers/CouncilProvider/helpers/breakGlassCouncil.consts'

export function FormRemoveCouncilMemberView() {
  const { breakGlassCouncilMembers } = useSelector((state: State) => state.council)
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

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

  // ----------------------------------------------------------------------------
  // remove bg council action
  const removeCouncilMemberAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!breakGlassAddress) {
      bug('Wrong breakGlass address')
      return null
    }

    const memberAddress = chosenDdItem?.tzAddress

    if (!memberAddress) return null

    return await removeCouncilMember(breakGlassAddress, memberAddress)
  }, [userAddress, breakGlassAddress, chosenDdItem?.tzAddress, bug])

  const removeBgCouncilContractContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REMOVE_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
      actionFn: removeCouncilMemberAction,
    }),
    [removeCouncilMemberAction],
  )

  const { action: handleRemoveCouncilMember } = useContractAction(removeBgCouncilContractContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await handleRemoveCouncilMember()

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

import React, { useState, useMemo } from 'react'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { DropDown, DDItemId } from 'app/App.components/DropDown/NewDropdown'
import { CouncilFormHeaderStyled, CouncilFormStyled } from './BreakGlassCouncilForm.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { BgCounsilDdForms } from '../helpers/council.consts'
import Icon from '../../../app/App.components/Icon/Icon.view'

// types
import { CouncilContext } from 'providers/CouncilProvider/council.provider.types'

// helpers
import { removeCouncilMember } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { getShortTzAddress } from '../../../utils/tzAdress'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useUserContext } from 'providers/UserProvider/user.provider'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { REMOVE_BREAK_GLASS_COUNCIL_MEMBER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'

type DdItemType = {
  content: React.ReactNode
  tzAddress: string
  id: number
}

export function FormRemoveCouncilMemberView({
  breakGlassCouncilMembers,
}: {
  breakGlassCouncilMembers: CouncilContext['breakGlassCouncilMembers']
}) {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const dropDownItems = useMemo(
    () =>
      breakGlassCouncilMembers.map<DdItemType>((item, index) => ({
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

  const [chosenDdItem, setChosenDdItem] = useState<DdItemType | undefined>()

  // remove bg council action
  const removeBgCouncilContractContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REMOVE_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
      actionFn: async () => {
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
      },
    }),
    [userAddress, breakGlassAddress, chosenDdItem?.tzAddress],
  )

  const { action: handleRemoveCouncilMember } = useContractAction(removeBgCouncilContractContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleRemoveCouncilMember()

      setChosenDdItem(undefined)
    } catch (e) {
      console.error('removeBgCouncilContractContractActionProps', e)
    }
  }

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (foundItem) setChosenDdItem(foundItem)
  }

  const isButtonDisabled = isActionActive || !chosenDdItem

  return (
    <CouncilFormStyled formName={BgCounsilDdForms.REMOVE_COUNCIL_MEMBER}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Remove Council Member</H2Title>
        <div className="descr">Please enter valid function parameters for removing a council member</div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="select-council-member">
          <label>Choose Council Member to remove</label>
          <DropDown
            placeholder="Choose member"
            activeItem={chosenDdItem}
            items={dropDownItems}
            clickItem={handleClickDropdownItem}
          />
        </div>

        <div className="submit-form right">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="minus" />
            Remove Council Member
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}

import { useState, useMemo } from 'react'

// helpers
import { removeCouncilMember } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { getShortTzAddress } from '../../../../utils/tzAdress'

// consts
import { MavrykCounsilDdForms } from '../../helpers/council.consts'
import { REMOVE_COUNCIL_MEMBER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'
import { DDItemId, DropDown, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'

// types
import { CouncilContext } from 'providers/CouncilProvider/council.provider.types'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

type DdItemType = {
  content: React.ReactNode
  tzAddress: string
  id: number
}

export const MavCouncilFormRemoveCouncilMember = ({
  councilMembers,
}: {
  councilMembers: CouncilContext['councilMembers']
}) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const [chosenDdItem, setChosenDdItem] = useState<DdItemType | undefined>()

  const dropDownItems = useMemo(
    () =>
      councilMembers.map<DdItemType>((item, index) => ({
        content: <DropdownTruncateOption text={`${item.name} - ${getShortTzAddress({ tzAddress: item.userId })}`} />,
        tzAddress: item.userId,
        id: index,
      })),
    [councilMembers],
  )

  // remove council member council action
  const removeCouncilMemberContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REMOVE_COUNCIL_MEMBER_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        if (!chosenDdItem) {
          bug('Select member to remove')
          return null
        }

        return await removeCouncilMember(councilAddress, chosenDdItem.tzAddress)
      },
    }),
    [chosenDdItem, userAddress, councilAddress],
  )

  const { action: handleRemoveCouncilMember } = useContractAction(removeCouncilMemberContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleRemoveCouncilMember()

      setChosenDdItem(undefined)
    } catch (error) {
      console.error('CouncilFormRemoveCouncilMember', error)
    }
  }

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (foundItem) setChosenDdItem(foundItem)
  }

  const isButtonDisabled = isActionActive || !chosenDdItem

  return (
    <CouncilFormStyled formName={MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER}>
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
            placeholder="Choose Member Address"
            activeItem={chosenDdItem}
            items={dropDownItems}
            clickItem={handleClickDropdownItem}
          />
        </div>

        <div className="submit-form">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="minus" />
            Remove Council Member
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}

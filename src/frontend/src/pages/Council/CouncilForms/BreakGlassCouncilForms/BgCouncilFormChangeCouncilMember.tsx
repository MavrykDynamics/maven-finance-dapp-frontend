import React, { useMemo, useState } from 'react'

// view
import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import { IPFSUploader } from '../../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { DDItemId, DropDown, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'

// types
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'
import { CouncilContext } from 'providers/CouncilProvider/council.provider.types'
import { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

// helpers
import { changeBgCouncilMember } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { getShortTzAddress } from '../../../../utils/tzAdress'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../../app/App.components/Button/Button.constants'
import { CHANGE_BREAK_GLASS_COUNCIL_MEMBER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { BgCouncilDdForms } from '../../helpers/council.consts'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

const INIT_FORM = {
  newCouncilMemberAddress: '',
  newMemberWebsite: '',
  newMemberName: '',
  newMemberImage: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  newCouncilMemberAddress: INPUT_STATUS_DEFAULT,
  newMemberWebsite: INPUT_STATUS_DEFAULT,
  newMemberName: INPUT_STATUS_DEFAULT,
  newMemberImage: INPUT_STATUS_DEFAULT,
}

type DdItemType = {
  content: React.ReactNode
  tzAddress: string
  id: number
}

export function BgCouncilFormChangeCouncilMember({
  councilMaxLengths,
  breakGlassCouncilMembers,
}: {
  councilMaxLengths: CouncilMaxLength
  breakGlassCouncilMembers: CouncilContext['breakGlassCouncilMembers']
}) {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()

  const dropDownItems = useMemo(
    () =>
      breakGlassCouncilMembers.map<DdItemType>((item, index) => ({
        content: (
          <DropdownTruncateOption text={`${item.name} - ${getShortTzAddress({ tzAddress: item.memberAddress })}`} />
        ),
        tzAddress: item.memberAddress,
        id: index,
      })),
    [breakGlassCouncilMembers],
  )

  type DropDownItemType = (typeof dropDownItems)[0]

  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()
  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { newCouncilMemberAddress, newMemberWebsite, newMemberName, newMemberImage } = form

  const oldCouncilMemberAddress = chosenDdItem?.tzAddress

  // chnage bg council member action
  const changeBgCouncilContractContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: CHANGE_BREAK_GLASS_COUNCIL_MEMBER_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!breakGlassAddress) {
          bug('Wrong breakGlass address')
          return null
        }

        if (!oldCouncilMemberAddress) {
          bug('Select member to change')
          return null
        }

        if (breakGlassCouncilMembers.find(({ memberAddress }) => memberAddress === newCouncilMemberAddress)) {
          bug('New user is already council member')
          return null
        }

        return await changeBgCouncilMember(
          breakGlassAddress,
          oldCouncilMemberAddress,
          newCouncilMemberAddress,
          newMemberName,
          newMemberWebsite,
          newMemberImage,
        )
      },
    }),
    [
      userAddress,
      breakGlassAddress,
      oldCouncilMemberAddress,
      breakGlassCouncilMembers,
      newCouncilMemberAddress,
      newMemberName,
      newMemberWebsite,
      newMemberImage,
    ],
  )

  const { action: handleChangeCouncilMember } = useContractAction(changeBgCouncilContractContractActionProps)

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleChangeCouncilMember()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
      setChosenDdItem(undefined)
    } catch (error) {
      console.error('FormChangeCouncilMemberViewe', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (!foundItem) return
    setChosenDdItem(foundItem)
  }

  const {
    memberAddressProps,
    memberAddressSettings,
    newMemberNameProps,
    newMemberNameSettings,
    newMemberWebsiteProps,
    newMemberWebsiteSettings,
  } = useMemo(() => {
    const validateLenght = validateFormField(setFormInputStatus)
    const validateAddress = validateFormAddress(setFormInputStatus)

    const memberAddressProps = {
      name: 'newCouncilMemberAddress',
      value: newCouncilMemberAddress,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateAddress(e)
      },
      required: true,
    }

    const newMemberNameProps = {
      name: 'newMemberName',
      value: newMemberName,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateLenght(e, councilMaxLengths.councilMemberNameMaxLength)
      },
      required: true,
    }
    const newMemberWebsiteProps = {
      name: 'newMemberWebsite',
      value: newMemberWebsite,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateLenght(e, councilMaxLengths.councilMemberWebsiteMaxLength)
      },
      required: true,
    }
    return {
      memberAddressProps,
      memberAddressSettings: {
        inputStatus: formInputStatus.newCouncilMemberAddress,
      },
      newMemberNameProps,
      newMemberNameSettings: {
        inputStatus: formInputStatus.newMemberName,
      },
      newMemberWebsiteProps,
      newMemberWebsiteSettings: {
        inputStatus: formInputStatus.newMemberWebsite,
      },
    }
  }, [
    councilMaxLengths.councilMemberNameMaxLength,
    councilMaxLengths.councilMemberWebsiteMaxLength,
    formInputStatus.newCouncilMemberAddress,
    formInputStatus.newMemberName,
    formInputStatus.newMemberWebsite,
    newCouncilMemberAddress,
    newMemberName,
    newMemberWebsite,
  ])

  return (
    <CouncilFormStyled $formName={BgCouncilDdForms.BG_CHANGE_COUNCIL_MEMBER}>
      <a
        className="info-link"
        href="https://mavenfinance.io/litepaper#break-glass-council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Change Council Member</H2Title>
        <div className="descr">Please enter valid function parameters for changing a council member</div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="select-council-member">
          <label>Choose Council Member to change</label>
          <DropDown
            placeholder="Choose member"
            activeItem={chosenDdItem}
            items={dropDownItems}
            clickItem={handleClickDropdownItem}
          />
        </div>

        <div className="member-address">
          <label>Council Member Address</label>
          <Input inputProps={memberAddressProps} settings={memberAddressSettings} />
        </div>

        <div className="member-name">
          <label>Council Member Name</label>
          <Input inputProps={newMemberNameProps} settings={newMemberNameSettings} />
        </div>

        <div className="member-url ">
          <label>Council Member Website URL</label>
          <Input inputProps={newMemberWebsiteProps} settings={newMemberWebsiteSettings} />
        </div>

        <div className="member-image">
          <label>Upload Profile Pic</label>

          <IPFSUploader
            typeFile="image"
            imageIpfsUrl={newMemberImage}
            className="form-ipfs"
            setIpfsImageUrl={(e: string) => {
              setForm({ ...form, newMemberImage: e })
              setFormInputStatus({
                ...formInputStatus,
                newMemberImage: Boolean(e) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
              })
            }}
          />
        </div>

        <div className="submit-form">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="exchange" />
            Change Council Member
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}

import React, { useState, useMemo } from 'react'

// components
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { FormStyled } from './BreakGlassCouncilForm.style'

// types
import { INPUT_STATUS_DEFAULT, InputStatusType } from 'app/App.components/Input/Input.constants'
import { CouncilContext } from 'providers/CouncilProvider/council.provider.types'
import { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

// helpers
import { changeCouncilMember } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { getShortTzAddress } from '../../../utils/tzAdress'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// consts
import { CHANGE_BREAK_GLASS_COUNCIL_MEMBER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
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

export function FormChangeCouncilMemberView({
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
  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { newCouncilMemberAddress, newMemberWebsite, newMemberName, newMemberImage } = form

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

        const oldCouncilMemberAddress = chosenDdItem?.tzAddress
        if (!oldCouncilMemberAddress) return null

        return await changeCouncilMember(
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
      chosenDdItem?.tzAddress,
      newCouncilMemberAddress,
      newMemberName,
      newMemberWebsite,
      newMemberImage,
    ],
  )

  const { action: handleChangeCouncilMember } = useContractAction(changeBgCouncilContractContractActionProps)

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

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (!foundItem) return
    setChosenDdItem(foundItem)
  }

  const newCouncilMemberAddressProps = {
    name: 'newCouncilMemberAddress',
    value: newCouncilMemberAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const newCouncilMemberAddressSettings = {
    inputStatus: formInputStatus.newCouncilMemberAddress,
  }

  const newMemberNameProps = {
    name: 'newMemberName',
    value: newMemberName,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, councilMaxLengths.councilMemberNameMaxLength),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e, councilMaxLengths.councilMemberNameMaxLength)
    },
    required: true,
  }

  const newMemberNameSettings = {
    inputStatus: formInputStatus.newMemberName,
  }

  const newMemberWebsiteProps = {
    name: 'newMemberWebsite',
    value: newMemberWebsite,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, councilMaxLengths.councilMemberWebsiteMaxLength),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e, councilMaxLengths.councilMemberWebsiteMaxLength)
    },
    required: true,
  }

  const newMemberWebsiteSettings = {
    inputStatus: formInputStatus.newMemberWebsite,
  }

  return (
    <FormStyled>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <h1>Change Council Member</h1>
      <p>Please enter valid function parameters for changing a council member</p>

      <form onSubmit={handleSubmit}>
        <div className="form-fields input-size-secondary margin-bottom-20">
          <label>Choose Council Member to change</label>
          <DropDown
            placeholder="Choose member"
            activeItem={chosenDdItem}
            items={dropDownItems}
            clickItem={handleClickDropdownItem}
          />
        </div>

        <div className="form-fields in-two-columns">
          <div className="input-size-secondary margin-bottom-20">
            <label>Council Member Address</label>
            <Input inputProps={newCouncilMemberAddressProps} settings={newCouncilMemberAddressSettings} />
          </div>

          <div className="input-size-tertiary">
            <label>Council Member Name</label>
            <Input inputProps={newMemberNameProps} settings={newMemberNameSettings} />
          </div>

          <div className="input-size-secondary margin-bottom-20">
            <label>Council Member Website URL</label>
            <Input inputProps={newMemberWebsiteProps} settings={newMemberWebsiteSettings} />
          </div>
        </div>

        <IPFSUploader
          typeFile="image"
          imageIpfsUrl={newMemberImage}
          className="form-ipfs"
          setIpfsImageUrl={(e: string) => {
            setForm({ ...form, newMemberImage: e })
            setFormInputStatus({ ...formInputStatus, newMemberImage: Boolean(e) ? 'success' : 'error' })
          }}
          title={'Upload Profile Pic'}
        />

        <div className="align-to-right">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
            <Icon id="exchange" />
            Change Council Member
          </NewButton>
        </div>
      </form>
    </FormStyled>
  )
}

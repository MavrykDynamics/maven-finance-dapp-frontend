import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'
import Icon from '../../../app/App.components/Icon/Icon.view'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { CouncilMaxLength } from '../../../utils/TypesAndInterfaces/Council'

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// actions
import { changeCouncilMember } from '../BreakGlassCouncil.actions'

// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

const INIT_FORM = {
  newCouncilMemberAddress: '',
  newMemberWebsite: '',
  newMemberName: '',
  newMemberImage: '',
}

export function FormChangeCouncilMemberView(maxLength: CouncilMaxLength) {
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
  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newCouncilMemberAddress: '',
    newMemberWebsite: '',
    newMemberName: '',
    newMemberImage: '',
  })

  const { newCouncilMemberAddress, newMemberWebsite, newMemberName, newMemberImage } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const oldCouncilMemberAddress = chosenDdItem?.tzAddress
      if (!oldCouncilMemberAddress) return

      await dispatch(
        changeCouncilMember(
          oldCouncilMemberAddress,
          newCouncilMemberAddress,
          newMemberName,
          newMemberWebsite,
          newMemberImage,
        ),
      )

      setForm(INIT_FORM)
      setFormInputStatus({
        newCouncilMemberAddress: '',
        newMemberWebsite: '',
        newMemberName: '',
        newMemberImage: '',
      })
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
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, maxLength.councilMemberNameMaxLength),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e, maxLength.councilMemberNameMaxLength)
    },
    required: true,
  }

  const newMemberNameSettings = {
    inputStatus: formInputStatus.newMemberName,
  }

  const newMemberWebsiteProps = {
    name: 'newMemberWebsite',
    value: newMemberWebsite,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, maxLength.councilMemberWebsiteMaxLength),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e, maxLength.councilMemberWebsiteMaxLength)
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

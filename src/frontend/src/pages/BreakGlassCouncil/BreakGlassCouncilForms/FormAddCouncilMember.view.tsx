import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

// components
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { CouncilMaxLength } from '../../../utils/TypesAndInterfaces/Council'

// helpers
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// actions
import { addCouncilMember } from '../BreakGlassCouncil.actions'

const INIT_FORM = {
  memberAddress: '',
  newMemberWebsite: '',
  newMemberName: '',
  newMemberImage: '',
}

export function FormAddCouncilMemberView(maxLength: CouncilMaxLength) {
  const dispatch = useDispatch()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    memberAddress: '',
    newMemberWebsite: '',
    newMemberName: '',
    newMemberImage: '',
  })

  const { memberAddress, newMemberWebsite, newMemberName, newMemberImage } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await dispatch(addCouncilMember(memberAddress, newMemberName, newMemberWebsite, newMemberImage))

      setForm(INIT_FORM)
      setFormInputStatus({
        memberAddress: '',
        newMemberWebsite: '',
        newMemberName: '',
        newMemberImage: '',
      })
    } catch (error) {
      console.error('FormAddCouncilMemberView', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const memberAddressProps = {
    name: 'memberAddress',
    value: memberAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const memberAddressSettings = {
    inputStatus: formInputStatus.memberAddress,
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

      <h1>Add Council Member</h1>
      <p>Please enter valid function parameters for adding a council member</p>

      <form onSubmit={handleSubmit}>
        <div className="form-fields in-two-columns">
          <div className="input-size-secondary margin-bottom-20">
            <label>Council Member Address</label>
            <Input inputProps={memberAddressProps} settings={memberAddressSettings} />
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
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT}>
            <Icon id="plus" />
            Add Council Member
          </NewButton>
        </div>
      </form>
    </FormStyled>
  )
}

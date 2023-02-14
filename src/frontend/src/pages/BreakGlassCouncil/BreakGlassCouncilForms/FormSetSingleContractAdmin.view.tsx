import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

// components
import { ACTION_PRIMARY, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton.controller'
import Icon from 'app/App.components/Icon/Icon.view'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// actions
import { setSingleContractAdmin } from '../BreakGlassCouncil.actions'

// helpers
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

const INIT_FORM = {
  newAdminAddress: '',
  targetContract: '',
}

export function FormSetSingleContractAdminView() {
  const dispatch = useDispatch()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newAdminAddress: '',
    targetContract: '',
  })

  const { newAdminAddress, targetContract } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await dispatch(setSingleContractAdmin(newAdminAddress, targetContract))
      setForm(INIT_FORM)
      setFormInputStatus({
        newAdminAddress: '',
        targetContract: '',
      })
    } catch (error) {
      console.error('FormSetSingleContractAdminView', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const newAdminAddressProps = {
    name: 'newAdminAddress',
    value: newAdminAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const newAdminAddressSettings = {
    inputStatus: formInputStatus.newAdminAddress,
  }

  const targetContractProps = {
    name: 'targetContract',
    value: targetContract,
    onBlur: handleBlur,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
    },
    required: true,
  }

  const targetContracSettings = {
    inputStatus: formInputStatus.targetContract,
  }

  return (
    <FormStyled>
      <h1>Set Single Contract Admin</h1>
      <p>Please enter valid function parameters for adding a vestee</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>New Admin Address</label>
          <Input className="margin-bottom-20" inputProps={newAdminAddressProps} settings={newAdminAddressSettings} />

          <label>Target Contract</label>
          <Input inputProps={targetContractProps} settings={targetContracSettings} />
        </div>

        <NewButton kind={ACTION_PRIMARY} type={SUBMIT}>
          <Icon id="profile" />
          Set Contract Admin
        </NewButton>
      </form>
    </FormStyled>
  )
}

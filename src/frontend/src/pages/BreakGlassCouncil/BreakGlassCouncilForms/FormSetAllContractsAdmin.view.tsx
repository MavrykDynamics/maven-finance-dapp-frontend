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
import { setAllContractsAdmin } from '../BreakGlassCouncil.actions'

// helpers
import { validateFormAddress } from 'utils/validatorFunctions'

const INIT_FORM = {
  newAdminAddress: '',
}

export function FormSetAllContractsAdminView() {
  const dispatch = useDispatch()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newAdminAddress: '',
  })

  const { newAdminAddress } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await dispatch(setAllContractsAdmin(newAdminAddress))
      setForm(INIT_FORM)
      setFormInputStatus({
        newAdminAddress: '',
      })
    } catch (error) {
      console.error('FormSetAllContractsAdminView', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const inputProps = {
    name: 'newAdminAddress',
    value: newAdminAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const inputSettings = {
    inputStatus: formInputStatus.newAdminAddress,
  }

  return (
    <FormStyled>
      <h1>Set All Contracts Admin</h1>
      <p>Please enter valid function parameters for adding a vestee</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>New Admin Address</label>

          <Input inputProps={inputProps} settings={inputSettings} />
        </div>

        <NewButton kind={ACTION_PRIMARY} type={SUBMIT}>
          <Icon id="profile" />
          Set Contracts Admin
        </NewButton>
      </form>
    </FormStyled>
  )
}

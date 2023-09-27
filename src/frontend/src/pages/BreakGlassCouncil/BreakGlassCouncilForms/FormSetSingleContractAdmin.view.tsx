import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// components
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// actions
// import { setSingleContractAdmin } from '../BreakGlassCouncil.actions'

// helpers
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'
import { State } from 'reducers'

const INIT_FORM = {
  newAdminAddress: '',
  targetContract: '',
}

// TODO: update with setContractsAdmin
export function FormSetSingleContractAdminView() {
  const dispatch = useDispatch()
  const { isActionActive } = useSelector((state: State) => state.loading)

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newAdminAddress: '',
    targetContract: '',
  })

  const { newAdminAddress, targetContract } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      // await dispatch(setSingleContractAdmin(newAdminAddress, targetContract))

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
      <p>Please enter valid function parameters for setting admin</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>New Admin Address</label>
          <Input className="margin-bottom-20" inputProps={newAdminAddressProps} settings={newAdminAddressSettings} />

          <label>Target Contract</label>
          <Input inputProps={targetContractProps} settings={targetContracSettings} />
        </div>

        <div className="btn-wrapper">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
            <Icon id="profile" />
            Set Contract Admin
          </NewButton>
        </div>
      </form>
    </FormStyled>
  )
}

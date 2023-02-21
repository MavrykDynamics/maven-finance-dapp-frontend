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
import { signAction } from '../BreakGlassCouncil.actions'

const INIT_FORM = {
  breakGlassActionID: '',
}

export function FormSignActionView() {
  const dispatch = useDispatch()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    breakGlassActionID: '',
  })

  const { breakGlassActionID } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await dispatch(signAction(Number(breakGlassActionID)))
      
      setForm(INIT_FORM)
      setFormInputStatus({
        breakGlassActionID: '',
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

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormInputStatus((prev) => {
      return { ...prev, [e.target.name]: e.target.value ? 'success' : 'error' }
    })
  }

  const inputProps = {
    name: 'breakGlassActionID',
    value: breakGlassActionID,
    onBlur: handleBlur,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
    },
    required: true,
  }

  const inputSettings = {
    inputStatus: formInputStatus.breakGlassActionID,
  }

  return (
    <FormStyled>
      <h1>Sign Action</h1>
      <p>Please enter valid function parameters for sign action</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>Break Glass Action ID</label>

          <Input inputProps={inputProps} settings={inputSettings} />
        </div>

        <NewButton kind={ACTION_PRIMARY} type={SUBMIT}>
          <Icon id="sign" />
          Sign Action
        </NewButton>
      </form>
    </FormStyled>
  )
}

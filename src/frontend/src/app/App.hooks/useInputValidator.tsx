import { useState, useCallback } from 'react'
import { INPUT_STATUS_ERROR, InputStatusType } from 'app/App.components/Input/Input.constants'

// utils
import { validateInput } from 'app/App.utils/input'

export interface InputValidatorProps<T> {
  originalErrorMessage?: string
  status: InputStatusType
  onChange: (e: React.ChangeEvent<T>) => void
}

export function useInputValidator<G extends HTMLInputElement | HTMLTextAreaElement>({
  originalErrorMessage,
  status,
  onChange,
}: InputValidatorProps<G>) {
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = useCallback(
    (e: React.ChangeEvent<G>) => {
      const { value } = e.target

      const errorMessage = validateInput(value)
      setErrorMsg(errorMessage)

      onChange(e)
    },
    [errorMsg, onChange],
  )

  const internalErrorMsg = Boolean(errorMsg) ? errorMsg : Boolean(originalErrorMessage) ? originalErrorMessage : ''
  const internalInputStatus = internalErrorMsg ? INPUT_STATUS_ERROR : status

  return { status: internalInputStatus, errorMessage: internalErrorMsg, handleChange }
}

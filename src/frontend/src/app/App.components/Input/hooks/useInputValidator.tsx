import { useState, useCallback } from 'react'
import {
  ERR_MSG_INPUT,
  ERR_MSG_TOAST,
  INPUT_STATUS_ERROR,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'

// utils
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { ValidatorFnType } from '../newInput.type'

export interface InputValidatorProps<T> {
  originalErrorMessage?: string
  status: InputStatusType
  onChange: (e: React.ChangeEvent<T>) => void
  onBlur?: (e: React.ChangeEvent<T>) => void
  validationFns?: ValidatorFnType[]
  handleMax?: () => void
  value?: string | number
  allowInputAfterError: boolean
}

// * @param originalErrorMessage - error message passed from props to the Input component
// * @param status - input validation status
// * @param onChange - simple input onChange handler
// * @param handleMax - handleMax custom fn passed from props to the Input component (used to set input value woth max possible amount based on some conditions defined outside)
// * @param validationFns - array of validators used to validate and set input errors (read README.md)
// * @param value - the actual input value
export function useInputValidator<G extends HTMLInputElement | HTMLTextAreaElement>({
  originalErrorMessage,
  status,
  onChange,
  onBlur,
  handleMax,
  validationFns,
  value,
  allowInputAfterError,
}: InputValidatorProps<G>) {
  const { bug } = useToasterContext()
  const [errorMsg, setErrorMsg] = useState('')
  const [toastErrMsg, setToastErrMsg] = useState('')

  const internalValidationFn = useCallback(
    (value: string) => {
      if (errorMsg) setErrorMsg('')
      if (toastErrMsg) setToastErrMsg('')
      const hasError = validationFns?.some(([fn, type, args], idx) => {
        const errMsg = args ? fn.apply(null, [value, ...args]) : fn(value)

        // show err message under the input
        if (errMsg && type === ERR_MSG_INPUT) {
          setErrorMsg(errMsg)
          return true
        }

        // show err message with toast
        if (errMsg && type === ERR_MSG_TOAST) {
          setToastErrMsg(errMsg)
          // if there is a toast err message, prohibit showing toast
          if (!toastErrMsg) bug(errMsg, 'Input error')
          return true
        }

        if (idx === validationFns.length - 1 && !errMsg) {
          setErrorMsg(errMsg)
          setToastErrMsg(errMsg)
        }

        return false
      })

      return hasError
    },
    [bug, errorMsg, toastErrMsg, validationFns],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<G>) => {
      const { value } = e.target

      const hasError = internalValidationFn(value)

      const _allowInput = allowInputAfterError ? allowInputAfterError : !hasError
      if (_allowInput) {
        onChange(e)
      }
    },
    [allowInputAfterError, internalValidationFn, onChange],
  )

  const handleBlur = useCallback(
    (e: React.ChangeEvent<G>) => {
      const { value } = e.target

      const hasError = internalValidationFn(value)

      if (!hasError) {
        setToastErrMsg('')
        setErrorMsg('')
      }

      onBlur?.(e)
    },
    [internalValidationFn, onBlur],
  )

  const handleMaxAmount = useCallback(() => {
    handleMax?.()
    if (value) {
      internalValidationFn(value.toString())
    }
  }, [handleMax, internalValidationFn, value])

  const internalErrorMsg = Boolean(errorMsg) ? errorMsg : Boolean(originalErrorMessage) ? originalErrorMessage : ''
  const internalInputStatus = internalErrorMsg ? INPUT_STATUS_ERROR : status

  return { status: internalInputStatus, errorMessage: internalErrorMsg, handleChange, handleBlur, handleMaxAmount }
}

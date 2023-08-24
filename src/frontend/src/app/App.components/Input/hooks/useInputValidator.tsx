import { useState, useCallback } from 'react'
import {
  ERR_MSG_INPUT,
  ERR_MSG_NONE,
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
  onBlur?: (e: React.FocusEvent<T>) => void
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toastErrMsg, setToastErrMsg] = useState<string | null>(null)

  const internalValidationFn = useCallback(
    (value: string) => {
      if (errorMsg) setErrorMsg(null)
      if (toastErrMsg) setToastErrMsg(null)
      const hasError = validationFns?.some(([fn, type, args], idx) => {
        const [containsError, errMsg] = args ? fn.apply(null, [value, ...args]) : fn(value)

        // show err message under the input or just make input red if errMessage equals "none" -> (ERR_MSG_NONE)
        if ((containsError && type === ERR_MSG_INPUT) || type === ERR_MSG_NONE) {
          setErrorMsg(errMsg)
          return true
        }

        // show err message with toast
        if (containsError && type === ERR_MSG_TOAST) {
          setToastErrMsg(errMsg)
          // if there is a toast err message, prohibit showing toast
          if (!toastErrMsg) bug(errMsg ?? '', 'Input error')
          return true
        }

        if (idx === validationFns.length - 1 && !containsError) {
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
    (e: React.FocusEvent<G>) => {
      const { value } = e.target

      const hasError = internalValidationFn(value)

      if (!hasError) {
        setToastErrMsg(null)
        setErrorMsg(null)
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

  const doNotShowErrorMsg = errorMsg === ERR_MSG_NONE || toastErrMsg === ERR_MSG_NONE
  const internalErrorMsg = errorMsg !== null ? errorMsg : Boolean(originalErrorMessage) ? originalErrorMessage : null
  const internalInputStatus = internalErrorMsg !== null ? INPUT_STATUS_ERROR : status

  return {
    status: internalInputStatus,
    errorMessage: doNotShowErrorMsg ? null : internalErrorMsg,
    handleChange,
    handleBlur,
    handleMaxAmount,
  }
}

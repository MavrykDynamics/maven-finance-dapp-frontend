import { useState, useCallback, useEffect } from 'react'
import {
  ERR_MSG_INPUT,
  ERR_MSG_TOAST,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'

// utils
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { ValidatorFnType } from '../newInput.type'

export interface InputValidatorProps<T> {
  originalErrorMessage?: string
  status: InputStatusType
  onChange: (e: React.ChangeEvent<T>) => void
  validationFns?: ValidatorFnType[]
  handleMax?: () => void
  value?: string | number
}

/**
 * 
 * @param originalErrorMessage - error message passed from props to the Input component 
 * @param status - input validation status
 * @param onChange - simple input onChange handler
 * @param handleMax - handleMax custom fn passed from props to the
                      Input component (used to set input value woth max possible amount based on some conditions defined outside)
* @param validationFns - array of validators used to validate and set input errors (read README.md)
* @param value - the actual input value
 * @returns 
 */
export function useInputValidator<G extends HTMLInputElement | HTMLTextAreaElement>({
  originalErrorMessage,
  status,
  onChange,
  handleMax,
  validationFns,
  value,
}: InputValidatorProps<G>) {
  const { bug } = useToasterContext()
  const [errorMsg, setErrorMsg] = useState('')
  const [toastErrMsg, setToastErrMsg] = useState('')

  const internalValidationFn = useCallback(
    (value: string) => {
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
    [bug, toastErrMsg, validationFns],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<G>) => {
      const { value } = e.target

      const hasError = internalValidationFn(value)

      if (!hasError) onChange(e)
    },
    [internalValidationFn, onChange],
  )

  const handleMaxAmount = useCallback(() => {
    handleMax?.()
    if (value) {
      internalValidationFn(value.toString())
    }
  }, [handleMax, internalValidationFn, value])

  // if status is success - remove errors
  useEffect(() => {
    if (status !== INPUT_STATUS_ERROR) {
      if (errorMsg) setErrorMsg('')
      if (toastErrMsg) setToastErrMsg('')
    }
  }, [errorMsg, status, toastErrMsg])

  const internalErrorMsg = Boolean(errorMsg) ? errorMsg : Boolean(originalErrorMessage) ? originalErrorMessage : ''
  const internalInputStatus = internalErrorMsg ? INPUT_STATUS_ERROR : status

  return { status: internalInputStatus, errorMessage: internalErrorMsg, handleChange, handleMaxAmount }
}

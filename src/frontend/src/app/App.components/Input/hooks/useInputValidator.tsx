import { useState, useCallback, useRef } from 'react'
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
  validationFns?: ValidatorFnType[]
}

export function useInputValidator<G extends HTMLInputElement | HTMLTextAreaElement>({
  originalErrorMessage,
  status,
  onChange,
  validationFns,
}: InputValidatorProps<G>) {
  const { bug } = useToasterContext()
  const [errorMsg, setErrorMsg] = useState('')
  const [toastErrMsg, setToastErrMsg] = useState('')

  const handleChange = useCallback(
    (e: React.ChangeEvent<G>) => {
      const { value } = e.target

      // boolean arr, if validator function passes the condition - true, otherwise - false
      // when arr has "false" - just not allow user to type
      const resultArr =
        validationFns?.map(([fn, type, args], idx) => {
          const errMsg = args ? fn.apply(null, [value, ...args]) : fn(value)

          // show err message under the input
          if (errMsg && type === ERR_MSG_INPUT) {
            setErrorMsg(errMsg)
          }

          // show err message with toast
          if (errMsg && type === ERR_MSG_TOAST) {
            setToastErrMsg(errMsg)
            // if there is toast err message, prohibit to show toast
            if (!toastErrMsg) bug(errMsg, 'Input error')
            return false
          }

          if (idx === validationFns.length - 1 && !errMsg) {
            setErrorMsg(errMsg)
            setToastErrMsg(errMsg)
          }

          return true
        }) ?? []

      if (!resultArr?.includes(false)) onChange(e)
    },
    [errorMsg, onChange, validationFns, bug],
  )

  const internalErrorMsg = Boolean(errorMsg) ? errorMsg : Boolean(originalErrorMessage) ? originalErrorMessage : ''
  const internalInputStatus = internalErrorMsg ? INPUT_STATUS_ERROR : status

  return { status: internalInputStatus, errorMessage: internalErrorMsg, handleChange }
}

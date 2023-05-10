import { INPUT_STATUS_ERROR, InputStatusType } from 'app/App.components/Input/Input.constants'

export type InputValidatorProps = {
  originalErrorMessage?: string
  internalErrorMessage?: string
  status: InputStatusType
}

export const useInputValidator = ({ originalErrorMessage, internalErrorMessage, status }: InputValidatorProps) => {
  const internalErrorMsg = Boolean(internalErrorMessage)
    ? internalErrorMessage
    : Boolean(originalErrorMessage)
    ? originalErrorMessage
    : ''
  const internalInputStatus = internalErrorMsg ? INPUT_STATUS_ERROR : status

  return { finalStatus: internalInputStatus, finalErrorMessage: internalErrorMsg }
}

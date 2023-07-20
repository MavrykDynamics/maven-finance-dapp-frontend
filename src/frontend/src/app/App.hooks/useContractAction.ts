// consts
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { WALLTET_ERROR_FIELD } from 'errors/consts/error.const'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'

// helpers
import { unknownToError } from 'errors/error'
import { isContractErrorPayload } from 'errors/helpers/walletError.helper'
import { checkIfActionSuccess } from 'providers/DappConfigProvider/helpers/dappAction.helpers'
import { sleep } from 'utils/api/sleep'

// types
import {
  ActionErrorReturnType,
  ActionSuccessReturnType,
  ActionTypes,
} from 'providers/DappConfigProvider/dappConfig.provider.types'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

export type HookContractActionArgs<G = unknown> = {
  actionType: ActionTypes
  actionFn: (args?: G) => Promise<ActionErrorReturnType | ActionSuccessReturnType | null>
  dappActionCallback?: () => void
  afterActionCallback?: () => void
  willUseSharedError?: boolean
  isSilentAction?: boolean
}

export const useContractAction = <G>({
  actionType,
  actionFn,
  dappActionCallback,
  afterActionCallback,
  willUseSharedError = false,
  isSilentAction = false,
}: HookContractActionArgs<G>): ((args?: G) => Promise<void>) => {
  const { bug, info, loading, setSharedError } = useToasterContext()
  const { setAction, toggleActionCompletion, toggleActionFullScreenLoader } = useDappConfigContext()

  return async (...args) => {
    try {
      // call the actual action
      const actionResult = await actionFn(...args)

      // optional callback which us triggered right after action call
      // used f.e. to close some popup etc.
      afterActionCallback?.()

      if (!actionResult) return

      let toasterId = null

      if (checkIfActionSuccess(actionResult)) {
        const { operation } = actionResult

        toggleActionCompletion(true)
        if (!isSilentAction) {
          toggleActionFullScreenLoader(true)

          info(
            TOASTER_ACTIONS_TEXTS[actionType]['start']['message'],
            TOASTER_ACTIONS_TEXTS[actionType]['start']['title'],
          )

          await sleep(5000)

          // show toaster loader after 5000ms after operation started
          toasterId = loading(
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          )

          toggleActionFullScreenLoader(false)
        }

        const operationConfirm = await operation.confirmation()
        const operationLvl = operationConfirm.block.header.level

        setAction({ actionName: actionType, toasterId, operationLvl, callback: dappActionCallback })
      } else if (isContractErrorPayload(actionResult.error)) {
        if (willUseSharedError) {
          setSharedError(WALLTET_ERROR_FIELD, {
            ...actionResult.error,
            actionId: actionType,
          })
        } else {
          const { message, description } = actionResult.error
          bug(description, message)
        }
      } else {
        const { message } = actionResult?.error
        throw new Error(message)
      }
    } catch (e) {
      setAction(null)
      const parsedError = unknownToError(e)
      bug(parsedError.message)
    }
  }
}

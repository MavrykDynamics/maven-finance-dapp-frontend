// consts
import { TOASTER_ACTIONS_TEXTS } from 'providers/ToasterProvider/helpers/texts/toasterActions.texts'
import { WALLTET_ERROR_FIELD } from 'errors/consts/error.const'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'

// helpers
import { unknownToError } from 'errors/error'
import { isContractErrorPayload } from 'errors/helpers/walletError.helper'
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

type ActionReturnPayload = Promise<ActionErrorReturnType | ActionSuccessReturnType | null>

const checkIfActionSuccess = (
  actionResult: ActionErrorReturnType | ActionSuccessReturnType,
): actionResult is ActionSuccessReturnType => actionResult.actionSuccess === true

export type HookContractActionArgs<G = unknown> = {
  actionType: ActionTypes
  actionFn: ((args: G) => ActionReturnPayload) | (() => ActionReturnPayload)
  dappActionCallback?: () => void
  afterActionCallback?: () => void
  errActionCallback?: () => void
  successActionCallback?: () => void
  willUseSharedError?: boolean
  isSilentAction?: boolean
}

export const useContractAction = <G>({
  actionType,
  actionFn,
  dappActionCallback,
  afterActionCallback,
  errActionCallback,
  successActionCallback,
  willUseSharedError = false,
  isSilentAction = false,
}: HookContractActionArgs<G>): { action: () => Promise<void>; actionWithArgs: (args: G) => Promise<void> } => {
  const { bug, info, loading, setSharedError } = useToasterContext()
  const { setAction, toggleActionCompletion, toggleActionFullScreenLoader } = useDappConfigContext()

  async function invokeAction(actionResult: ActionErrorReturnType | ActionSuccessReturnType | null) {
    try {
      // optional callback which is triggered right after action call
      // used f.e. to close some popup etc.
      afterActionCallback?.()

      if (!actionResult) return

      let toasterId = null

      if (checkIfActionSuccess(actionResult)) {
        const { operation } = actionResult

        toggleActionCompletion(true)

        successActionCallback?.()

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
        // @ts-expect-error
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
      errActionCallback?.()
      const parsedError = unknownToError(e)
      bug(parsedError.message)
    }
  }

  const actionWithArgs: (args: G) => Promise<void> = async (...args) => {
    // call the actual action
    const actionResult = await actionFn(...args)
    return await invokeAction(actionResult)
  }

  const action: () => Promise<void> = async () => {
    // call the actual action
    const actionResult = await (actionFn as () => ActionReturnPayload)()
    return await invokeAction(actionResult)
  }

  return { action, actionWithArgs }
}

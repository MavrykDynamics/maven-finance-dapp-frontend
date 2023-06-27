import { ActionErrorReturnType, ActionSuccessReturnType } from '../dappConfig.provider.types'

export const checkIfActionSuccess = (
  actionResult: ActionErrorReturnType | ActionSuccessReturnType,
): actionResult is ActionSuccessReturnType => actionResult.actionSuccess === true

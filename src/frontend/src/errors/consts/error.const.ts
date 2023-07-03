import { TezosWalletErrorPayload } from 'errors/error.type'
import { WalletActionType } from 'types/actions.type'

export const WALLTET_ERROR_FIELD = 'walletError'

export const DEFAULT_TEZOS_ERROR: TezosWalletErrorPayload & {actionId: WalletActionType} = {
  actionId: null,
  message: 'Something went wrong',
  description: 'Something went wrong, you are not allowed to continue current operation',
}

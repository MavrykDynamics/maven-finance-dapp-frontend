import { TezosWalletErrorPayload } from 'errors/error.type'

export const WALLTET_ERROR_FIELD = 'walletError'

export const DEFAULT_TEZOS_ERROR: TezosWalletErrorPayload = {
  message: 'Something went wrong',
  description: 'Something went wrong, you are not allowed to continue current operation',
}

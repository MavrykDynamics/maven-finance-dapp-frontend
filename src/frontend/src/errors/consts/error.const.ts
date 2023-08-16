import { WalletErrorPayload } from 'errors/error.type'

export const WALLTET_ERROR_FIELD = 'walletError'

export const DEFAULT_WALLET_ERROR: WalletErrorPayload = {
  message: 'Something went wrong',
  description: 'Something went wrong, you are not allowed to continue current operation',
}

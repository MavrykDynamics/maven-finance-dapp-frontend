import { OpKind, MavrykToolkit, TransferParams } from '@mavrykdynamics/webmavryk'

type BatchOp = TransferParams & { kind: OpKind.TRANSACTION }

/**
 * Build FA1.2 approval batch operations: reset approval to 0, then approve the desired amount.
 * This is required because some FA1.2 contracts revert if you approve a non-zero amount
 * when there's an existing non-zero allowance.
 */
export const buildFA12ApprovalOps = (
  tokenContract: Awaited<ReturnType<MavrykToolkit['wallet']['at']>>,
  spender: string,
  amount: number,
): BatchOp[] => [
  {
    kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
    ...tokenContract.methods.approve(spender, 0).toTransferParams(),
  },
  {
    kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
    ...tokenContract.methods.approve(spender, amount).toTransferParams(),
  },
]

/**
 * Build FA2 add_operator batch operation.
 */
export const buildFA2AddOperatorOp = (
  tokenContract: Awaited<ReturnType<MavrykToolkit['wallet']['at']>>,
  owner: string,
  operator: string,
  tokenId: number = 0,
): BatchOp => ({
  kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
  ...tokenContract.methods
    .update_operators([
      {
        add_operator: {
          owner,
          operator,
          token_id: tokenId,
        },
      },
    ])
    .toTransferParams(),
})

/**
 * Build FA2 remove_operator batch operation.
 */
export const buildFA2RemoveOperatorOp = (
  tokenContract: Awaited<ReturnType<MavrykToolkit['wallet']['at']>>,
  owner: string,
  operator: string,
  tokenId: number = 0,
): BatchOp => ({
  kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
  ...tokenContract.methods
    .update_operators([
      {
        remove_operator: {
          owner,
          operator,
          token_id: tokenId,
        },
      },
    ])
    .toTransferParams(),
})

type TokenType = 'fa12' | 'fa2' | 'mav'

/**
 * Wraps a main operation with the appropriate token approval/operator operations
 * based on the token type. For FA1.2, wraps with approve(0) + approve(amount).
 * For FA2, wraps with add_operator before and remove_operator after.
 * For MAV, returns the main operation with mumav amount attached.
 */
export const buildTokenApprovalBatch = async ({
  tezos,
  tokenType,
  tokenAddress,
  spender,
  owner,
  amount,
  mainOps,
  tokenId = 0,
}: {
  tezos: MavrykToolkit
  tokenType: TokenType
  tokenAddress: string
  spender: string
  owner: string
  amount: number
  mainOps: BatchOp[]
  tokenId?: number
}): Promise<BatchOp[]> => {
  switch (tokenType) {
    case 'fa12': {
      const tokenContract = await tezos.wallet.at(tokenAddress)
      return [...buildFA12ApprovalOps(tokenContract, spender, amount), ...mainOps]
    }
    case 'fa2': {
      const tokenContract = await tezos.wallet.at(tokenAddress)
      return [
        buildFA2AddOperatorOp(tokenContract, owner, spender, tokenId),
        ...mainOps,
        buildFA2RemoveOperatorOp(tokenContract, owner, spender, tokenId),
      ]
    }
    case 'mav':
      return mainOps.map((op) => ({
        ...op,
        mumav: true,
        amount,
      }))
  }
}

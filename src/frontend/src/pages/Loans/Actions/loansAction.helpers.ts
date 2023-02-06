import { OpKind } from '@taquito/taquito'

export const getFa2Batch = ({
  assetName,
  assetAmount,
  operatorAddress,
  assetId,
  assetContract,
  contractMethod,
  userAddress,
  isDepositCollateral,
}: {
  operatorAddress: string
  assetAmount: number
  assetName: string
  userAddress: string
  assetId: number
  assetContract: any
  contractMethod: any
  isDepositCollateral: boolean
}) => {
  const fa2AddOperator = [
    {
      add_operator: {
        owner: userAddress,
        operator: operatorAddress,
        token_id: assetId, // Should be a number, usually 0
      },
    },
  ]

  const fa2RemoveOperator = [
    {
      remove_operator: {
        owner: userAddress,
        operator: operatorAddress,
        token_id: assetId, // Should be a number, usually 0
      },
    },
  ]

  return [
    {
      kind: OpKind.TRANSACTION,
      ...assetContract.methods.update_operators(fa2AddOperator).toTransferParams(),
    },
    {
      kind: OpKind.TRANSACTION,
      ...(isDepositCollateral
        ? contractMethod(assetAmount, assetName).toTransferParams()
        : contractMethod(assetName, assetAmount).toTransferParams()),
    },
    {
      kind: OpKind.TRANSACTION,
      ...assetContract.methods.update_operators(fa2RemoveOperator).toTransferParams(),
    },
  ]
}

export const getFa12Batch = ({
  assetName,
  assetAmount,
  operatorAddress,
  assetContract,
  contractMethod,
}: {
  operatorAddress: string
  assetAmount: number
  assetName: string
  assetContract: any
  contractMethod: any
}) => {
  return [
    {
      kind: OpKind.TRANSACTION,
      ...assetContract.methods.approve(operatorAddress, 0).toTransferParams(),
    },
    {
      kind: OpKind.TRANSACTION,
      ...assetContract.methods.approve(operatorAddress, assetAmount).toTransferParams(),
    },
    {
      kind: OpKind.TRANSACTION,
      ...contractMethod(assetAmount, assetName).toTransferParams(),
    },
  ]
}

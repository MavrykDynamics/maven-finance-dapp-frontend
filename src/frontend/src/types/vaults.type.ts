import { z } from 'zod'
import { vaultBlockSchema } from '../schemas/vaults/block.schema'
import { xtzDelegationDataSchema } from '../schemas/vaults/xtzDelegationData.schema'

export type VaultBlockType = z.infer<typeof vaultBlockSchema>
export type XtzDelegationDataType = z.infer<typeof xtzDelegationDataSchema>

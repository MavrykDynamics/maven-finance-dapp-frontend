import { z } from 'zod'

export const tezosContractErrorPayloadErrorItemSchema = z.record(z.string(), z.unknown())

export const tezosContractErrorPayload = z.object({
  errors: z.array(tezosContractErrorPayloadErrorItemSchema).optional(),
  errorDetails: z.string().optional(),
  id: z.string(),
  kind: z.string(),
  name: z.string(),
  message: z.string(),
  scope: z.string().optional(),
})

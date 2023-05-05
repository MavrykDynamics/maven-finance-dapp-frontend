import { z } from 'zod'
import { dipDupHeadSchema } from 'schemas/dipdup.schema'

export type DipDupHeadType = z.infer<typeof dipDupHeadSchema>

export interface DipDupGraphQLResponse {
  data: {
    dipdup_head_status: DipDupHeadType[]
  }
}

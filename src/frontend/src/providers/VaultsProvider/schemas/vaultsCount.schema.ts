import { z } from 'zod'

export const VaultStatsSchemaResponse = z.object({
  totalVaults: z.object({
    aggregate: z.object({
      count: z.number(),
    }),
  }),
  userOpenVaults: z.object({
    nodes: z.array(
      z.object({
        vaults_aggregate: z.object({
          aggregate: z.object({
            count: z.number(),
          }),
        }),
      }),
    ),
  }),
  otherOpenVaultsWithAllowance: z.object({
    nodes: z.array(
      z.object({
        vaults_aggregate: z.object({
          aggregate: z.object({
            count: z.number(),
          }),
        }),
      }),
    ),
  }),
})

export type VaultStatsTypeResponse = z.infer<typeof VaultStatsSchemaResponse>

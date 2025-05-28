import { z } from 'zod'

export const VaultStatsSchemaResponse = z.object({
  totalVaults: z.array(
    z.object({
      vaults_aggregate: z.object({
        aggregate: z.object({
          count: z.number(),
        }),
      }),
    }),
  ),

  userOpenVaults: z.array(
    z.object({
      vaults_aggregate: z.object({
        aggregate: z.object({
          count: z.number(),
        }),
      }),
    }),
  ),

  otherOpenVaultsWithAllowance: z.array(
    z.object({
      vaults_aggregate: z.object({
        aggregate: z.object({
          count: z.number(),
        }),
      }),
    }),
  ),
})

export type VaultStatsTypeResponse = z.infer<typeof VaultStatsSchemaResponse>

import { z } from 'zod'

export const satelliteDashboardAvgSchema = z.object({
  avg_delegated_smvn: z.number(), // large integer
  avg_delegation_fee: z.number(), // floating point
  avg_free_smvn_balance: z.number(), // large float
  avg_mvn_staked: z.number(), // large integer
  avg_participation_rate: z.number(), // percent-like float
})

// Example usage:
export type SatelliteDashboardAvgMetrics = z.infer<typeof satelliteDashboardAvgSchema>

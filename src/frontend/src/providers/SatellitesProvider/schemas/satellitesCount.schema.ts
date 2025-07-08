import { z } from 'zod'

const AggregateCountSchema = z.object({
  aggregate: z.object({
    count: z.number(),
  }),
})

export const SatellitesCountsSchema = z.object({
  totalSatellites: AggregateCountSchema,
  userSatellites: AggregateCountSchema,
  activeSatellites: AggregateCountSchema,
  oracleSatellites: AggregateCountSchema,
})

export type SatellitesCountsType = z.infer<typeof SatellitesCountsSchema>

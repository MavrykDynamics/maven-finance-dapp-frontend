import { SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'

export function getTotalDelegatedMVK(
  satelliteIds: Array<SatelliteRecordType['address']>,
  satellitesMapper: Record<string, SatelliteRecordType>,
): number {
  if (!satelliteIds) return 0
  return satelliteIds.reduce(
    (sum, currentAddress) =>
      sum +
      Number(satellitesMapper[currentAddress].totalDelegatedAmount + satellitesMapper[currentAddress].sMvkBalance),
    0,
  )
}

export const ALL_SATELLITES_SUB = 'all'

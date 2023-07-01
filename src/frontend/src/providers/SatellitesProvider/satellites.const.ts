import { MavrykTheme } from 'styles/interfaces'
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

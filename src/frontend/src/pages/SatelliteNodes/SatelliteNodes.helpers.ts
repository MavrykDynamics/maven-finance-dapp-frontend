import { SatelliteMapper, SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'

export const handleSortSatellites =
  (sortType: string, satelliteMapper: SatelliteMapper) =>
  (a: SatelliteRecordType['address'], b: SatelliteRecordType['address']): number => {
    const satelliteA = satelliteMapper[a],
      satelliteB = satelliteMapper[b]
    switch (sortType) {
      case 'Lowest Fee':
        return satelliteA.satelliteFee - satelliteB.satelliteFee
      case 'Highest Fee':
        return satelliteB.satelliteFee - satelliteA.satelliteFee
      case 'Delegated MVK':
        return (
          satelliteB.totalDelegatedAmount +
          satelliteB.sMvkBalance -
          (satelliteA.totalDelegatedAmount + satelliteA.sMvkBalance)
        )
      case 'Participation':
        return (
          (satelliteB.satelliteMetrics.proposalParticipation + satelliteB.satelliteMetrics.votingPartisipation) / 2 -
          (satelliteA.satelliteMetrics.proposalParticipation + satelliteA.satelliteMetrics.votingPartisipation) / 2
        )
      default:
        return 0
    }
  }

export const handleFilterSatellites =
  (inputSearch: string, satelliteMapper: SatelliteMapper) =>
  (satelliteAddress: SatelliteRecordType['address']): boolean => {
    const satellite = satelliteMapper[satelliteAddress]
    return (
      satellite.address.toLowerCase().includes(inputSearch.toLowerCase()) ||
      satellite.name.toLowerCase().includes(inputSearch.toLowerCase())
    )
  }

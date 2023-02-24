import { State } from 'reducers'
import { SatelliteRecordType } from 'utils/TypesAndInterfaces/Satellites'

export const handleSortSatellites =
  (sortType: string, satelliteMapper: State['satellites']['satelliteMapper']) =>
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
  (inputSearch: string, satelliteMapper: State['satellites']['satelliteMapper']) =>
  (satelliteAddress: SatelliteRecordType['address']): boolean => {
    const satellite = satelliteMapper[satelliteAddress]
    return (
      satellite.address.toLowerCase().includes(inputSearch.toLowerCase()) ||
      satellite.name.toLowerCase().includes(inputSearch.toLowerCase())
    )
  }

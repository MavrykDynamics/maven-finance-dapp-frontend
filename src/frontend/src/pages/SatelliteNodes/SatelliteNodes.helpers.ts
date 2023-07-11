import { getSatelliteParticipations } from 'providers/SatellitesProvider/helpers/satellites.utils'
import { SatelliteMapper, SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'

export const handleSortSatellites =
  ({
    sortType,
    satelliteMapper,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
  }: {
    sortType: string
    satelliteMapper: SatelliteMapper
    proposalsAmount: number
    satelliteGovActionsAmount: number
    finRequestsAmount: number
  }) =>
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
        const satelliteA_participation = getSatelliteParticipations({
          satellite: satelliteA,
          proposalsAmount,
          satelliteGovActionsAmount,
          finRequestsAmount,
        })

        const satelliteB_participation = getSatelliteParticipations({
          satellite: satelliteB,
          proposalsAmount,
          satelliteGovActionsAmount,
          finRequestsAmount,
        })
        return (
          (satelliteB_participation.proposalParticipation + satelliteB_participation.votingPartisipation) / 2 -
          (satelliteA_participation.proposalParticipation + satelliteA_participation.votingPartisipation) / 2
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
      satellite &&
      (satellite.address.toLowerCase().includes(inputSearch.toLowerCase()) ||
        satellite.name.toLowerCase().includes(inputSearch.toLowerCase()))
    )
  }

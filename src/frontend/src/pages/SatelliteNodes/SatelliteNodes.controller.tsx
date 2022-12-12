import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import OracleSatellitesView from './SatelliteNodes.view'
import { getSatelliteMetrics } from 'pages/Satellites/Satellites.helpers'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'
import { State } from 'reducers'
import { getDelegationStorage, delegate, undelegate } from 'pages/Satellites/Satellites.actions'

const SatelliteNodes = () => {
  const {
    delegationStorage: { activeSatellites = [] },
  } = useSelector((state: State) => state.delegation)
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const {
    governanceStorage: { financialRequestLedger, proposalLedger },
    pastProposals,
  } = useSelector((state: State) => state.governance)
  const {
    emergencyGovernanceStorage: { emergencyGovernanceLedger },
  } = useSelector((state: State) => state.emergencyGovernance)
  const dispatch = useDispatch()

  const [allSatellites, setAllSatellites] = useState<SatelliteRecord[]>(activeSatellites)
  const [filteredSatelliteList, setFilteredSatelliteList] = useState<SatelliteRecord[]>(activeSatellites)

  useEffect(() => {
    dispatch(getDelegationStorage())
  }, [])

  useEffect(() => {
    setAllSatellites(activeSatellites)
    setFilteredSatelliteList(activeSatellites)
  }, [activeSatellites])

  const handleSearch = (e: {
    target: {
      value: string
    }
  }) => {
    const searchQuery = e.target.value
    let searchResult: SatelliteRecord[] = []

    if (searchQuery !== '') {
      searchResult = allSatellites.filter(
        (item: SatelliteRecord) =>
          item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    } else {
      searchResult = allSatellites
    }

    setFilteredSatelliteList(searchResult)
  }

  const handleSelect = (selectedOption: DropdownItemType) => {
    const sortedData = (filteredSatelliteList ? [...filteredSatelliteList] : []).sort((a, b) => {
      let res = 0
      switch (selectedOption.text) {
        case 'Lowest Fee':
          res = Number(a.satelliteFee) - Number(b.satelliteFee)
          break
        case 'Highest Fee':
          res = Number(b.satelliteFee) - Number(a.satelliteFee)
          break
        case 'Delegated MVK':
          res = b.totalDelegatedAmount + b.sMvkBalance - (a.totalDelegatedAmount + a.sMvkBalance)

          break
        case 'Participation':
          const aMetrics = getSatelliteMetrics(
            pastProposals,
            proposalLedger,
            emergencyGovernanceLedger,
            a,
            feeds,
            financialRequestLedger,
          )

          const bMetrics = getSatelliteMetrics(
            pastProposals,
            proposalLedger,
            emergencyGovernanceLedger,
            b,
            feeds,
            financialRequestLedger,
          )

          res =
            (bMetrics.proposalParticipation + bMetrics.votingPartisipation) / 2 -
            (aMetrics.proposalParticipation + aMetrics.votingPartisipation) / 2
          break
        default:
          return 0
      }
      return res
    })

    setFilteredSatelliteList(sortedData)
  }

  const delegateCallback = (satelliteAddress: string) => {
    dispatch(delegate(satelliteAddress))
  }

  const undelegateCallback = (delegateAddress: string) => {
    dispatch(undelegate(delegateAddress))
  }

  return (
    <OracleSatellitesView
      handleSelect={handleSelect}
      handleSearch={handleSearch}
      delegateCallback={delegateCallback}
      undelegateCallback={undelegateCallback}
      satellitesList={filteredSatelliteList}
    />
  )
}

export default SatelliteNodes

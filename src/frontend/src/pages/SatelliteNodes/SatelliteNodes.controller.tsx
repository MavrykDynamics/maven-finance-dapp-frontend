import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import OracleSatellitesView from './SatelliteNodes.view'
import { getSatelliteMetrics } from 'pages/Satellites/Satellites.normalizer'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Satellites'
import { DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'
import { State } from 'reducers'
import { getDelegationStorage, delegate, undelegate, getSatellitesStorage } from 'pages/Satellites/Satellites.actions'
import { getFinancialRequestStorage } from 'pages/FinacialRequests/FiancialRequest.actions'
import { getFeedsStorage } from 'pages/DataFeeds/DataFeeds.actions'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

const SatelliteNodes = () => {
  const {
    delegationStorage: { activeSatellites = [] },
  } = useSelector((state: State) => state.delegation)
  const { feedsLedger, isLoaded: isFeedsLoaded } = useSelector((state: State) => state.dataFeeds)
  const { financialRequests, isLoaded: isFinancialRequestsLoaded } = useSelector(
    (state: State) => state.financialRequest,
  )
  const {
    governanceStorage: { proposalLedger },
    pastProposals,
  } = useSelector((state: State) => state.governance)
  const { eGovProposals } = useSelector((state: State) => state.emergencyGovernance)
  const dispatch = useDispatch()

  const [allSatellites, setAllSatellites] = useState<SatelliteRecord[]>(activeSatellites)
  const [filteredSatelliteList, setFilteredSatelliteList] = useState<SatelliteRecord[]>(activeSatellites)

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all([
        !isFeedsLoaded && dispatch(getFeedsStorage()),
        !isFinancialRequestsLoaded && dispatch(getFinancialRequestStorage()),
        dispatch(getGovernanceStorage()),
        dispatch(getDelegationStorage()),
        dispatch(getSatellitesStorage()),
      ])
    } catch (e) {}
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
            eGovProposals,
            a,
            feedsLedger,
            financialRequests,
          )

          const bMetrics = getSatelliteMetrics(
            pastProposals,
            proposalLedger,
            eGovProposals,
            b,
            feedsLedger,
            financialRequests,
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

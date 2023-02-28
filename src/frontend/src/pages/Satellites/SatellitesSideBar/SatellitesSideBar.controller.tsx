import dayjs from 'dayjs'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { checkIfUserIsSatellite, getTotalDelegatedMVK } from '../helpers/Satellites.consts'
import SatellitesSideBarView from './SatellitesSideBar.view'

const SatellitesSideBar = ({ isButton = true }: { isButton?: boolean }) => {
  const dispatch = useDispatch()
  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const {
    delegationStorage: { oraclesAmount, satelliteLedger, activeSatellites },
  } = useSelector((state: State) => state.delegation)
  const {
    config: { feedsFactoryAddress },
    feedsLedger,
  } = useSelector((state: State) => state.dataFeeds)
  const { delegationAddress } = useSelector((state: State) => state.contractAddresses)
  const numSatellites = activeSatellites?.length || 0
  const dataPointsCount = useMemo(
    () =>
      feedsLedger?.filter(
        (feed) => dayjs(Date.now()).diff(dayjs(feed?.last_completed_data_last_updated_at), 'minutes') <= 60,
      ).length,
    [feedsLedger],
  )
  const totalDelegatedMVK = getTotalDelegatedMVK(satelliteLedger)
  const averageRevard = feedsLedger?.length
    ? calcWithoutPrecision(
        (
          feedsLedger.reduce((acc, { reward_amount_smvk }) => {
            acc += reward_amount_smvk
            return acc
          }, 0) / (feedsLedger.length || 1)
        ).toString(),
      )
    : undefined

  useEffect(() => {
    dispatch(getDelegationStorage())
  }, [dispatch])

  return (
    <SatellitesSideBarView
      accountPkh={accountPkh}
      userIsSatellite={Boolean(isSatellite)}
      numberOfSatellites={numSatellites}
      totalDelegatedMVK={totalDelegatedMVK}
      isButton={isButton}
      satelliteFactory={delegationAddress?.address || ''}
      totalOracleNetworks={oraclesAmount}
      infoBlockAddresses={{
        satellite: delegationAddress?.address || '',
        oracle: feedsFactoryAddress,
      }}
      averageRevard={averageRevard}
      dataPointsCount={dataPointsCount}
    />
  )
}

export default SatellitesSideBar

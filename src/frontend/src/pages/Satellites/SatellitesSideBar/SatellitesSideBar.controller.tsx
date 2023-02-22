import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { getTotalDelegatedMVK } from '../helpers/Satellites.consts'
import SatellitesSideBarView from './SatellitesSideBar.view'

const SatellitesSideBar = ({ isButton = true }: { isButton?: boolean }) => {
  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const { oraclesIds, allSatellitesIds, satelliteMapper } = useSelector((state: State) => state.satellites)
  const {
    config: { feedsFactoryAddress },
    feedsLedger,
  } = useSelector((state: State) => state.dataFeeds)
  const { delegationAddress } = useSelector((state: State) => state.contractAddresses)
  const dataPointsCount = useMemo(
    () =>
      feedsLedger?.filter(
        (feed) => dayjs(Date.now()).diff(dayjs(feed?.last_completed_data_last_updated_at), 'minutes') <= 60,
      ).length,
    [feedsLedger],
  )
  const totalDelegatedMVK = getTotalDelegatedMVK(allSatellitesIds, satelliteMapper)
  const averageRevard = calcWithoutPrecision(
    feedsLedger.reduce((acc, { reward_amount_smvk }) => {
      acc += reward_amount_smvk
      return acc
    }, 0) / Math.max(feedsLedger.length, 1),
  )

  return (
    <SatellitesSideBarView
      accountPkh={accountPkh}
      userIsSatellite={isSatellite}
      numberOfSatellites={allSatellitesIds.length}
      totalDelegatedMVK={totalDelegatedMVK}
      isButton={isButton}
      satelliteFactory={delegationAddress?.address || ''}
      totalOracleNetworks={oraclesIds.length}
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

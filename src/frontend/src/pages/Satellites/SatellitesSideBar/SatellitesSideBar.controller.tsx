import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getTotalDelegatedMVK } from '../helpers/Satellites.consts'
import { getSatellitesStorage } from '../Satellites.actions'
import SatellitesSideBarView from './SatellitesSideBar.view'

const SatellitesSideBar = ({ isButton = true }: { isButton?: boolean }) => {
  const dispatch = useDispatch()
  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const {
    oraclesIds,
    activeSatellitesIds,
    allSatellitesIds,
    satelliteMapper,
    isLoaded: isSatellitesLoaded,
  } = useSelector((state: State) => state.satellites)
  const {
    config: { feedsFactoryAddress },
    feedsLedger,
  } = useSelector((state: State) => state.dataFeeds)
  const { delegationAddress } = useSelector((state: State) => state.contractAddresses)
  const numSatellites = activeSatellitesIds?.length || 0
  const dataPointsCount = useMemo(
    () =>
      feedsLedger?.filter(
        (feed) => dayjs(Date.now()).diff(dayjs(feed?.last_completed_data_last_updated_at), 'minutes') <= 60,
      ).length,
    [feedsLedger],
  )
  const totalDelegatedMVK = getTotalDelegatedMVK(allSatellitesIds, satelliteMapper)
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

  const { isLoading } = useDataLoader(async () => {
    if (!isSatellitesLoaded) {
      await dispatch(getSatellitesStorage)
    }
  }, [])

  return isLoading ? (
    <DataLoaderWrapper>
      <ClockLoader width={150} height={150} />
      <div className="text">Loading satellite info</div>
    </DataLoaderWrapper>
  ) : (
    <SatellitesSideBarView
      accountPkh={accountPkh}
      userIsSatellite={Boolean(isSatellite)}
      numberOfSatellites={numSatellites}
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

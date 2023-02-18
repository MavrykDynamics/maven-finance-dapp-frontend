import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { registerAsSatellite, updateSatelliteRecord } from './BecomeSatellite.actions'
import { getSatellitesStorage, getSatelliteConfig } from 'pages/Satellites/Satellites.actions'
import { DEFAULT_ACTIVE_SATELLITE } from 'pages/Satellites/helpers/Satellites.consts'

import { RegisterAsSatelliteForm } from '../../utils/TypesAndInterfaces/Forms'
import { BecomeSatelliteView } from './BecomeSatellite.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

export const BecomeSatellite = () => {
  const dispatch = useDispatch()
  const {
    accountPkh,
    user: { mySMvkTokenBalance },
  } = useSelector((state: State) => state.wallet)
  const { satelliteMapper, config, isLoaded: isSatellitesLoaded } = useSelector((state: State) => state.satellites)
  const { isLoaded: isDoormanLoaded } = useSelector((state: State) => state.doorman)

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all(
        [
          !isSatellitesLoaded && getSatellitesStorage(),
          !config.isConfigLoaded && getSatelliteConfig(),
          !isDoormanLoaded && getDoormanStorage(),
        ].filter(Boolean),
      )
    } catch (error) {}
  }, [])

  const usersSatelliteProfile = accountPkh
    ? satelliteMapper[accountPkh] ?? DEFAULT_ACTIVE_SATELLITE
    : DEFAULT_ACTIVE_SATELLITE

  const registerCallback = (form: RegisterAsSatelliteForm) => {
    dispatch(registerAsSatellite(form))
  }
  const updateSatelliteCallback = (form: RegisterAsSatelliteForm) => {
    dispatch(updateSatelliteRecord(form))
  }

  return isLoading ? (
    <DataLoaderWrapper>
      <ClockLoader width={150} height={150} />
      <div className="text">Loading satelliteData</div>
    </DataLoaderWrapper>
  ) : (
    <BecomeSatelliteView
      registerCallback={registerCallback}
      updateSatelliteCallback={updateSatelliteCallback}
      accountPkh={accountPkh}
      myTotalStakeBalance={mySMvkTokenBalance}
      satelliteConfig={config}
      usersSatellite={usersSatelliteProfile}
    />
  )
}

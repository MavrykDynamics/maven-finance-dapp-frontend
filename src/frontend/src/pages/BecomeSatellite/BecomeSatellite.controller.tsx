import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { registerAsSatellite, updateSatelliteRecord } from './BecomeSatellite.actions'
import { getSatelliteConfig } from 'pages/Satellites/Satellites.actions'
import { DEFAULT_ACTIVE_SATELLITE } from 'pages/Satellites/helpers/Satellites.consts'

import { RegisterAsSatelliteForm } from '../../utils/TypesAndInterfaces/Forms'
import { BecomeSatelliteView } from './BecomeSatellite.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { NotStakingBanner } from 'pages/Satellites/components/NotStakingBanner.view'
import { Page, PageContent } from 'styles'
import SatellitesSideBar from 'pages/Satellites/SatellitesSideBar/SatellitesSideBar.controller'

export const BecomeSatellite = () => {
  const dispatch = useDispatch()
  const {
    accountPkh = '',
    user: { mySMvkTokenBalance, isSatellite },
  } = useSelector((state: State) => state.wallet)
  const {
    satelliteMapper,
    config: { minimumStakedMvkBalance, isConfigLoaded },
  } = useSelector((state: State) => state.satellites)
  const { isLoaded: isDoormanLoaded } = useSelector((state: State) => state.doorman)

  const balanceOverMinStakedMvk = mySMvkTokenBalance >= minimumStakedMvkBalance

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all(
        [!isConfigLoaded && getSatelliteConfig(), !isDoormanLoaded && getDoormanStorage()].filter(Boolean),
      )
    } catch (error) {}
  }, [])

  const usersSatelliteProfile = satelliteMapper[accountPkh] ?? DEFAULT_ACTIVE_SATELLITE

  const registerCallback = (form: RegisterAsSatelliteForm) => dispatch(registerAsSatellite(form))
  const updateSatelliteCallback = (form: RegisterAsSatelliteForm) => dispatch(updateSatelliteRecord(form))

  return (
    <Page>
      <PageHeader
        page={isSatellite ? 'my satellite profile' : 'satellites'}
        avatar={usersSatelliteProfile.image || '/images/default-avatar.png'}
      />

      {!balanceOverMinStakedMvk && (
        <NotStakingBanner text={`To become a satellite you need to stake ${minimumStakedMvkBalance} MVK`} />
      )}

      <PageContent>
        <div>
          {isLoading ? (
            <DataLoaderWrapper>
              <ClockLoader width={150} height={150} />
              <div className="text">Loading satellite data</div>
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
          )}
        </div>
        <SatellitesSideBar isButton={false} />
      </PageContent>
    </Page>
  )
}

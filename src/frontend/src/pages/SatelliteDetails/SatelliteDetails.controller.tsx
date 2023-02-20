import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { delegate, getSatellitesStorage, undelegate } from 'pages/Satellites/Satellites.actions'
import { rewardsCompound } from 'pages/Doorman/Doorman.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { State } from 'reducers'

import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import SatellitesSideBar from 'pages/Satellites/SatellitesSideBar/SatellitesSideBar.controller'
import { SatelliteDetailsView } from './SatelliteDetails.view'
import SatellitePagination from './SatellitePagination/SatellitePagination.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { Page, PageContent } from 'styles'
import { EmptyContainer } from 'app/App.style'
import { useCallback } from 'react'

export const SatelliteDetails = () => {
  const dispatch = useDispatch()
  const { satelliteId } = useParams<{ satelliteId: string }>()

  const {
    accountPkh,
    user: { mySatelliteRewardsData, mySMvkTokenBalance },
  } = useSelector((state: State) => state.wallet)

  const { satelliteMapper, isLoaded } = useSelector((state: State) => state.satellites)

  const currentSatellite = satelliteMapper[satelliteId]

  const { isLoading } = useDataLoader(async () => {
    try {
      // TODO: ensure in this condition
      if (!currentSatellite && !isLoaded) {
        await dispatch(getSatellitesStorage(satelliteId))
      }
    } catch (e) {}
  }, [])

  const delegateCallback = useCallback((address: string) => {
    dispatch(delegate(address))
  }, [])

  const undelegateCallback = useCallback((address: string) => {
    dispatch(undelegate(address))
  }, [])

  const handleClaimRewards = useCallback(() => {
    if (accountPkh) dispatch(rewardsCompound(accountPkh))
  }, [accountPkh])

  return (
    <Page>
      <PageHeader page={'satellites'} />
      <PageContent>
        <div>
          <SatellitePagination />

          {isLoading ? (
            <DataLoaderWrapper>
              <ClockLoader width={150} height={150} />
              <div className="text">Loading satellite info</div>
            </DataLoaderWrapper>
          ) : currentSatellite ? (
            <SatelliteDetailsView
              satellite={currentSatellite}
              userSatelliteReward={mySatelliteRewardsData}
              delegateCallback={delegateCallback}
              undelegateCallback={undelegateCallback}
              claimRewardsCallback={handleClaimRewards}
              userStakedBalanceInSatellite={mySMvkTokenBalance}
            />
          ) : (
            <EmptyContainer>
              <img src="/images/not-found.svg" alt=" No proposals to show" />
              <figcaption> No satellite data</figcaption>
            </EmptyContainer>
          )}
        </div>
        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}

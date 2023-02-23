import { useDispatch, useSelector } from 'react-redux'

import { State } from '../../reducers'
import { getBreakGlassConfig, getContractStatuses } from './BreakGlass.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { BreakGlassView } from './BreakGlass.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

import { Page } from 'styles'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

export const BreakGlass = () => {
  const dispatch = useDispatch()
  const {
    breakGlassStatus,
    config: { glassBroken, whitelistDev, isConfigLoaded },
    isLoaded: isContractStatusesLoaded,
  } = useSelector((state: State) => state.breakGlass)

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all(
        [
          !isConfigLoaded && dispatch(getBreakGlassConfig()),
          !isContractStatusesLoaded && dispatch(getContractStatuses()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  return (
    <Page>
      <PageHeader page={'break glass'} />
      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading contracts statuses</div>
        </DataLoaderWrapper>
      ) : (
        <BreakGlassView
          breakGlassStatuses={breakGlassStatus}
          glassBroken={glassBroken}
          pauseAllActive={glassBroken}
          whitelistDev={whitelistDev}
        />
      )}
    </Page>
  )
}

import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { BreakGlassView } from './BreakGlass.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

import { Page } from 'styles'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { useBreakGlassConfigInit } from 'providers/BreakGlassProvider/hooks/useBreakGlassConfigInit'
import { useBreakGlassContext } from 'providers/BreakGlassProvider/breakGlass.provider'
import { useContactStatus } from 'providers/BreakGlassProvider/hooks/useContactStatus'

export const BreakGlass = () => {
  const {
    breakGlassStatus,
    config: { glassBroken, whitelistDev },
  } = useBreakGlassContext()

  const { isLoading: isConfigLoading } = useBreakGlassConfigInit()
  const { isLoading } = useContactStatus()

  return (
    <Page>
      <PageHeader page={'break glass'} />
      {isLoading && isConfigLoading ? (
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

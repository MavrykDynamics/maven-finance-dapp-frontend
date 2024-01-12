import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

// view
import { LoaderWrapper, ProposalSubmissionBannerStyled } from './ProposalSubmissionBanner.style'
import { Info } from 'app/App.components/Info/Info.view'

// consts
import { NEWLY_REGISTERED_SATELLITE_BANNER_TEXT } from 'texts/banners/satellite.text'
import { MOVE_CYCLE_BANNER_TEXT } from 'texts/banners/proposals.text'
import { GovPhases } from 'providers/ProposalsProvider/helpers/proposals.const'
import { INFO_DEFAULT } from 'app/App.components/Info/info.constants'

// utils
import { isAbortError } from 'errors/error'
import { api } from 'utils/api/api'
import {
  getTimestampByLevelUrl,
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
} from 'utils/api/api-helpers/getTimestampByLevel'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useProposalsContext } from 'providers/ProposalsProvider/proposals.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { sleep } from 'utils/api/sleep'

export const ProposalSubmissionBanner = () => {
  const { isNewlyRegisteredSatellite } = useUserContext()
  const {
    config: { currentRoundEndLevel, governancePhase },
  } = useProposalsContext()
  const { bug } = useToasterContext()

  const [needRefreshCycle, setNeedRefreshCycle] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (governancePhase !== GovPhases.PROPOSAL && governancePhase !== GovPhases.EXECUTION) return
    const abortController = new AbortController()

    ;(async () => {
      try {
        const { data: votingEndTimestamp } = await api(
          getTimestampByLevelUrl(currentRoundEndLevel),
          { signal: abortController.signal, headers: getTimestampByLevelHeaders },
          getTimestampByLevelSchema,
        )

        setNeedRefreshCycle(dayjs(votingEndTimestamp).diff() <= 0)

        // human delay
        await sleep(200)
        setIsLoading(false)
      } catch (e) {
        // TODO: handle fetch errors when error boundary will be ready
        if (!isAbortError(e)) {
          console.error('getting timestamp by lvl error: ', e)
          bug('Unexpected error happened occured, please reload the page')
        }
      }
    })()

    return () => abortController.abort()
  }, [currentRoundEndLevel])

  // if (isLoading) return <ClockLoader width={50} height={50} />

  // if (needRefreshCycle) {
  //   return (
  //     <ProposalSubmissionBannerStyled>
  //       <Info text={MOVE_CYCLE_BANNER_TEXT} type={INFO_DEFAULT} />
  //     </ProposalSubmissionBannerStyled>
  //   )
  // }

  // if (isNewlyRegisteredSatellite) {
  //   return (
  //     <ProposalSubmissionBannerStyled>
  //       <Info text={NEWLY_REGISTERED_SATELLITE_BANNER_TEXT} type={INFO_DEFAULT} />
  //     </ProposalSubmissionBannerStyled>
  //   )
  // }

  return (
    <>
      {isNewlyRegisteredSatellite && (
        <ProposalSubmissionBannerStyled>
          <Info text={NEWLY_REGISTERED_SATELLITE_BANNER_TEXT} type={INFO_DEFAULT} />
        </ProposalSubmissionBannerStyled>
      )}

      {isLoading ? (
        <LoaderWrapper>
          <ClockLoader width={50} height={50} />
        </LoaderWrapper>
      ) : needRefreshCycle ? (
        <ProposalSubmissionBannerStyled>
          <Info text={MOVE_CYCLE_BANNER_TEXT} type={INFO_DEFAULT} />
        </ProposalSubmissionBannerStyled>
      ) : null}
    </>
  )
}

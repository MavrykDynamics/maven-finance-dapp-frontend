import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

// view
import { ProposalSubmissionBannerStyled } from './ProposalSubmissionBanner.style'
import { Info } from 'app/App.components/Info/Info.view'

// consts
import { NEWLY_REGISTERED_SATELLITE_BANNER_TEXT } from 'texts/banners/satellite.text'
import { MOVE_CYCLE_BANNER_TEXT } from 'texts/banners/proposals.text'
import { GovPhases } from 'utils/TypesAndInterfaces/Governance'
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
import { useUserContext } from 'providers/UserProvider/user.provider'

// types
import { State } from 'reducers'

export const ProposalSubmissionBanner = () => {
  const { isNewlyRegisteredSatellite } = useUserContext()
  const { bug } = useToasterContext()

  const {
    config: { currentRoundEndLevel, governancePhase },
  } = useSelector((state: State) => state.governance)

  const [needRefreshCycle, setNeedRefreshCycle] = useState(false)

  useEffect(() => {
    if (governancePhase !== GovPhases.PROPOSAL) return
    const abortController = new AbortController()

    ;(async () => {
      try {
        const { data: votingEndTimestamp } = await api(
          getTimestampByLevelUrl(currentRoundEndLevel),
          { signal: abortController.signal, headers: getTimestampByLevelHeaders },
          getTimestampByLevelSchema,
        )

        setNeedRefreshCycle(dayjs(votingEndTimestamp).diff() <= 0)
      } catch (e) {
        // TODO: handle fetch errors when error boundary will be ready
        if (!isAbortError(e)) {
          console.error('getting timestamp by lvl error: ', e)
        }
        bug('Unexpected error happened occured, please reload the page')
      }
    })()

    return () => abortController.abort()
  }, [currentRoundEndLevel])

  if (needRefreshCycle) {
    return (
      <ProposalSubmissionBannerStyled>
        <Info text={MOVE_CYCLE_BANNER_TEXT} type={INFO_DEFAULT} />
      </ProposalSubmissionBannerStyled>
    )
  }

  if (isNewlyRegisteredSatellite) {
    return (
      <ProposalSubmissionBannerStyled>
        <Info text={NEWLY_REGISTERED_SATELLITE_BANNER_TEXT} type={INFO_DEFAULT} />
      </ProposalSubmissionBannerStyled>
    )
  }

  return null
}

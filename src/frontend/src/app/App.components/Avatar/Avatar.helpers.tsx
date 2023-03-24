// types
import { SatellitesState } from 'reducers/satellites'
import { CouncilMembers } from 'utils/TypesAndInterfaces/Council'

export const defaultUserImage = '/images/default-avatar.png'

type Props = {
  accountPkh?: string
  satelliteMapper: SatellitesState['satelliteMapper']
  councilMembers: CouncilMembers
  breakGlassCouncilMembers: CouncilMembers
  priorityImage?: 'satellite' | 'council' | 'breakGlassCouncil' | 'default'
}

export const getUserAvatar = ({
  accountPkh,
  satelliteMapper,
  councilMembers,
  breakGlassCouncilMembers,
  priorityImage,
}: Props) => {
  if (!accountPkh) return defaultUserImage

  const satelliteImage = satelliteMapper[accountPkh]?.image
  const councilImage = councilMembers.find((item) => item.userId === accountPkh)?.image
  const breakGlassCouncilImage = breakGlassCouncilMembers.find((item) => item.userId === accountPkh)?.image

  const images = {
    satellite: satelliteImage,
    council: councilImage,
    breakGlassCouncil: breakGlassCouncilImage,
    default: defaultUserImage,
  }

  if (priorityImage && images[priorityImage]) return images[priorityImage]

  return satelliteImage || councilImage || breakGlassCouncilImage || defaultUserImage
}

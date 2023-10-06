// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'

import { TzAddressStyles } from './TzAddress.constants'
import { TzAddressContainer, TzAddressIcon, TzAddressStyled } from './TzAddress.style'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type TzAddressProps = {
  tzAddress?: string | null
  type?: TzAddressStyles
  hasIcon?: boolean
  iconToLeft?: boolean | undefined
  isBold?: boolean
  isLargeIcon?: boolean
  shouldCopy?: boolean
  className?: string
  amountFromStart?: number
  amountFromEnd?: number
}

// TODO: make classes via classNames lib, check classes usage for styling
export const TzAddress = ({
  className,
  tzAddress,
  type,
  hasIcon = true,
  iconToLeft,
  isBold,
  isLargeIcon,
  shouldCopy = true,
  amountFromStart = 4,
  amountFromEnd = 4,
}: TzAddressProps) => {
  const { handleCopyText } = useDappConfigContext()

  const handleTzAddressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tzAddress && shouldCopy) {
      e.preventDefault()
      e.stopPropagation()
      handleCopyText(tzAddress)
    }
  }

  if (!tzAddress) return <TzAddressContainer className={`${className} tzAddressToClick`}>–</TzAddressContainer>

  const addrClasses = `${type} ${isBold ? 'bold' : ''}  ${isLargeIcon ? 'largeIcon' : ''} copyIcon`

  return (
    <TzAddressContainer
      className={`${className} tzAddressToClick ${!shouldCopy ? 'notCopy' : ''}`}
      onClick={(e) => handleTzAddressClick(e)}
    >
      {hasIcon && iconToLeft && shouldCopy && (
        <TzAddressIcon className={addrClasses}>
          <use xlinkHref="/icons/sprites.svg#copyToClipboard" />
        </TzAddressIcon>
      )}
      <TzAddressStyled className={addrClasses}>
        {getShortTzAddress({ tzAddress, amountFromEnd, amountFromStart })}
      </TzAddressStyled>
      {hasIcon && !iconToLeft && shouldCopy && (
        <TzAddressIcon className={addrClasses}>
          <use xlinkHref="/icons/sprites.svg#copyToClipboard" />
        </TzAddressIcon>
      )}
    </TzAddressContainer>
  )
}

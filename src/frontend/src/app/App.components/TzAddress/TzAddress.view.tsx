// helpers
import { getShortTzAddress } from '../../../utils/tzAdress'

import { PRIMARY_TZ_ADDRESS_COLOR, TzAddressStyles } from './TzAddress.constants'
import { TzAddressContainer, TzAddressIcon, TzAddressStyled } from './TzAddress.style'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type TzAddressProps = {
  tzAddress?: string | null
  type?: TzAddressStyles
  hasIcon?: boolean
  isBold?: boolean
  shouldCopy?: boolean
  className?: string
}

// TODO: make classes via classNames lib, check classes usage for styling
export const TzAddress = ({
  tzAddress,
  className = '',
  type = PRIMARY_TZ_ADDRESS_COLOR,
  hasIcon = true,
  shouldCopy = true,
  isBold,
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

  const addrClasses = `${type} ${isBold ? 'bold' : ''}  copyIcon`

  return (
    <TzAddressContainer
      className={`${className} tzAddressToClick ${!shouldCopy ? 'notCopy' : ''}`}
      onClick={(e) => handleTzAddressClick(e)}
    >
      <TzAddressStyled className={addrClasses}>{getShortTzAddress({ tzAddress })}</TzAddressStyled>
      {hasIcon && shouldCopy && (
        <TzAddressIcon className={addrClasses}>
          <use xlinkHref="/icons/sprites.svg#copyToClipboard" />
        </TzAddressIcon>
      )}
    </TzAddressContainer>
  )
}

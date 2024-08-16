import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { StatusFlagKind } from './StatusFlag.constants'
import { StatusFlagStyled } from './StatusFlag.style'
import { LIGHT_THEME } from 'consts/theme.const'
import { useMemo } from 'react'
import { DotsLoader } from '../Loader/Loader.view'

type StatusFlagProps = {
  text: string
  className?: string
  status: StatusFlagKind
  isFilled?: boolean
  isLoading?: boolean
}

export const StatusFlag = ({ text = '', isFilled = false, status, className, isLoading }: StatusFlagProps) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const isCardFilled = useMemo(() => isFilled || themeSelected === LIGHT_THEME, [themeSelected, isFilled])
  return (
    <StatusFlagStyled $kind={status} className={className} $isFilled={isCardFilled}>
      {isLoading ? <DotsLoader /> : text}
    </StatusFlagStyled>
  )
}

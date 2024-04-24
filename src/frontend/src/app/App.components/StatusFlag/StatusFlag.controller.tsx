import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { StatusFlagKind } from './StatusFlag.constants'
import { StatusFlagStyled } from './StatusFlag.style'
import { LIGHT_THEME } from 'consts/theme.const'
import { useMemo } from 'react'

type StatusFlagProps = {
  text: string
  className?: string
  status: StatusFlagKind
  isFilled?: boolean
}

export const StatusFlag = ({ text = '', isFilled = false, status, className }: StatusFlagProps) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const isCardFilled = useMemo(() => isFilled || themeSelected === LIGHT_THEME, [themeSelected, isFilled])
  return (
    <StatusFlagStyled $kind={status} className={className} $isFilled={isCardFilled}>
      {text}
    </StatusFlagStyled>
  )
}

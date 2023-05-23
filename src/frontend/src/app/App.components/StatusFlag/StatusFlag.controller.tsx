import { StatusFlagKind } from './StatusFlag.constants'
import { StatusFlagStyled } from './StatusFlag.style'

type StatusFlagProps = {
  text: string
  className?: string
  status: StatusFlagKind
}

export const StatusFlag = ({ text = '', status, className }: StatusFlagProps) => {
  return (
    <StatusFlagStyled kind={status} className={className}>
      {text}
    </StatusFlagStyled>
  )
}

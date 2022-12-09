import { StatusFlagStyle } from './StatusFlag.constants'
import { StatusFlagStyled } from './StatusFlag.style'

type StatusFlagViewProps = {
  kind: StatusFlagStyle
  text?: string
  className?: string
}

export const StatusFlagView = ({ kind, text, className }: StatusFlagViewProps) => {
  return <StatusFlagStyled className={`${kind} ${className}`}>{text}</StatusFlagStyled>
}

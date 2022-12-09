import { StatusFlagStyle, UP, DOWN, PRIMARY, INFO, WAITING } from './StatusFlag.constants'

import { StatusFlagView } from './StatusFlag.view'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'

type StatusFlagProps = {
  text?: string
  className?: string
  status: ProposalStatus | StatusFlagStyle | undefined
}

export const StatusFlag = ({ text = '', status, className }: StatusFlagProps) => {
  let kind: StatusFlagStyle
  switch (status) {
    case ProposalStatus.EXECUTED:
    case ProposalStatus.UNLOCKED:
      kind = UP
      break
    case ProposalStatus.DEFEATED:
    case ProposalStatus.DROPPED:
    case ProposalStatus.LOCKED:
    case ProposalStatus.TIMELOCK:
      kind = DOWN
      break
    case ProposalStatus.ONGOING:
      kind = PRIMARY
      break
    case ProposalStatus.WAITING:
      kind = WAITING
      break
    default:
      kind = INFO
      break
  }

  if (!Object.values(ProposalStatus).includes(status as ProposalStatus)) {
    kind = status as StatusFlagStyle
  }

  return <StatusFlagView className={className} kind={kind} text={text} />
}

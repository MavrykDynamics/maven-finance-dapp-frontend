import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { ProposalStatus } from 'utils/TypesAndInterfaces/Governance'

import { FRListItem, ListItemLeftSide } from './FRList.styles'

export type FRListItemProps = {
  id: number
  title: string
  onClickHandler?: () => void
  selected?: boolean
  dividedPassVoteMvkTotal: number
  status: ProposalStatus
}

const FRSListItem = ({
  id,
  title,
  dividedPassVoteMvkTotal,
  selected = false,
  onClickHandler,
  status,
}: FRListItemProps) => {
  return (
    <FRListItem selected={selected} onClick={onClickHandler}>
      <ListItemLeftSide className="financial-request">
        <span>{id}</span>
        <h4>{title}</h4>
      </ListItemLeftSide>
      <CommaNumber className="proposal-voted-mvk" value={dividedPassVoteMvkTotal} endingText={'voted'} />
      <StatusFlag text={status} status={status} />
    </FRListItem>
  )
}

export default FRSListItem

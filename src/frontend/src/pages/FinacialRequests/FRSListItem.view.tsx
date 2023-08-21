import { getRequestStatus } from 'providers/FinancialRequestsProvider/helpers/financialRequests.utils'
import { FinancialRequestRecord } from 'providers/FinancialRequestsProvider/helpers/financialRequests.types'

import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { FRListItem } from './FinancialRequests.style'

export type FRListItemProps = {
  id: number
  onClickHandler?: () => void
  selected?: boolean
  request: FinancialRequestRecord
}

export const FRSListItem = ({ id, selected = false, onClickHandler, request }: FRListItemProps) => {
  const dividedPassVoteMvkTotal = request.againstVotesMVKTotal + request.forVotesMVKTotal
  const status = getRequestStatus(request)

  return (
    <FRListItem selected={selected} onClick={onClickHandler}>
      <div className="id-and-title">
        <span>{id}</span>
        <h4>
          {request.type} {request.purpose}
        </h4>
      </div>
      <CommaNumber className="proposal-voted-mvk" value={dividedPassVoteMvkTotal} endingText={'voted'} />
      <StatusFlag text={status} status={status} />
    </FRListItem>
  )
}

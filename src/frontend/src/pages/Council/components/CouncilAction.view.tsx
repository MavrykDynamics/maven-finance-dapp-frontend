// view
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers
import { parseDate } from 'utils/time'
import { getSeparateCamelCase } from '../../../utils/parse'

// style
import { CouncilActionStyled } from '../Council.style'

type Props = {
  startDatetime: string | null
  actionType: string
  signersCount: number
  numCouncilMembers: number
  councilId: string
}

export const CouncilAction = (props: Props) => {
  const { startDatetime, actionType, signersCount, numCouncilMembers, councilId } = props
  const isMoreThanHalf = numCouncilMembers / 2 < signersCount

  return (
    <CouncilActionStyled>
      <div className="top">
        <div className="row top-row">
          <div className="column">
            <div className="column-name">Date</div>
            <div className="column-value">{parseDate({ time: startDatetime, timeFormat: 'MMM Do, YYYY' })}</div>
          </div>

          <div className="column">
            <div className="column-name">Purpose</div>
            <div className="column-value">{getSeparateCamelCase(actionType)}</div>
          </div>

          <div className="column">
            <div className="column-name">Multisig Approval</div>
            <div className={`column-value ${isMoreThanHalf ? 'is-green' : 'is-red'}`}>
              {signersCount}/{numCouncilMembers}
            </div>
          </div>

          <figure>
            <a
              className="icon-send"
              target="_blank"
              href={`${process.env.REACT_APP_TZKT_API}/${councilId}/operations/`}
              rel="noreferrer"
            >
              <Icon id="send" />
            </a>
          </figure>
        </div>
      </div>
    </CouncilActionStyled>
  )
}

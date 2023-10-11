import classNames from 'classnames'

// view
import Expand from 'app/App.components/Expand/Expand.view'
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import CustomLink from 'app/App.components/CustomLink/CustomLink'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CouncilActionBodyStyled, CouncilActionStyled } from './CouncilAction.style'
import { BgCounsilDdForms, MavrykCounsilDdForms } from 'pages/Council/helpers/council.consts'

// types
import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'

// utils
import { parseDate } from 'utils/time'

// consts
import { CouncilsActionsIds } from 'providers/CouncilProvider/helpers/council.types'
import { BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { CouncilUserOngoingActionGridCellsMapper } from './CouncilAction.consts'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { CouncilActionParamCellType } from 'pages/Council/helpers/council.types'
import { getCellData, getCellValueContent } from 'pages/Council/helpers/commonCouncil.utils'

type Props = {
  councilAction: CouncilActionType
  isBreakGlassCounsil: boolean
  handleDropAction: (actionId: number) => void
}

export const CouncilOngoingAction = ({ councilAction, handleDropAction, isBreakGlassCounsil }: Props) => {
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { id, actionName, actionClientId, councilSize, startDatetime, signersCount, parameters } = councilAction

  const bodyCells = getCouncilCardBodyCells(parameters, actionClientId, isBreakGlassCounsil, id)

  return (
    <CouncilActionStyled>
      <Expand
        header={
          <div className="header my-ongoing">
            <div className="column">
              <div className="name">Date</div>
              <div className="value">{parseDate({ time: startDatetime, timeFormat: 'MMM Do, YYYY' })}</div>
            </div>
            <div className="column">
              <div className="name">Purpose</div>
              <div className="value">{actionName}</div>
            </div>

            <div className="column">
              <div className="name">Signed</div>
              <div className={`value ${councilSize / 2 < signersCount ? 'is-green' : 'is-red'}`}>
                {signersCount}/{councilSize}
              </div>
            </div>
          </div>
        }
      >
        <CouncilActionBodyStyled cardActionId={actionClientId}>
          {bodyCells.map(({ className, value, valueContent, cellName, paramName }) => {
            return (
              <div className={classNames('column', className)} key={paramName}>
                <div className="name">{cellName}</div>
                <div className="value" title={value}>
                  {valueContent}
                </div>
              </div>
            )
          })}
          <div className="drop-btn">
            <NewButton
              kind={BUTTON_SECONDARY}
              form={BUTTON_WIDE}
              onClick={() => handleDropAction(id)}
              disabled={isActionActive}
            >
              <Icon id="navigation-menu_close" />
              Drop Action
            </NewButton>
          </div>
        </CouncilActionBodyStyled>
      </Expand>
    </CouncilActionStyled>
  )
}

const getCouncilCardBodyCells = (
  actionParams: CouncilActionType['parameters'],
  cardActionId: CouncilsActionsIds,
  isBreakGlassCounsil: boolean,
  actionId: number,
): CouncilActionParamCellType => {
  const actionParamsCells = CouncilUserOngoingActionGridCellsMapper[cardActionId]

  // if action has params to show show params
  if (actionParamsCells) {
    return actionParams.reduce<CouncilActionParamCellType>((acc, actionParam) => {
      const { parsedValue, columnData } = getCellData(actionParam, actionParamsCells)

      if (parsedValue && columnData) {
        acc.push({
          valueContent: getCellValueContent(columnData, parsedValue),
          className: columnData.className,
          value: parsedValue,
          paramName: actionParam.name,
          cellName: columnData.cellName,
        })
      }
      return acc
    }, [])
  }

  // for all other actions show their id only
  return [
    {
      className: 'action-meta',
      cellName: isBreakGlassCounsil ? 'Break Glass Action ID' : 'Council Action ID',
      paramName: 'actionId',
      valueContent: actionId.toString(),
      value: actionId.toString(),
    },
  ]
}

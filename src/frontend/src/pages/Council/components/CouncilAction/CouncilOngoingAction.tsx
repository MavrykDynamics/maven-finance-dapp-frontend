import classNames from 'classnames'

// view
import Expand from 'app/App.components/Expand/Expand.view'
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import { CouncilActionBodyStyled, CouncilActionStyled } from './CouncilAction.style'
import { BgCounsilDdForms, MavrykCounsilDdForms } from 'pages/Council/helpers/council.consts'

// types
import { CouncilActionType } from 'providers/CouncilProvider/council.provider.types'

// utils
import { parseDate } from 'utils/time'
import { getClientActionIdByName } from 'pages/Council/helpers/commonCouncil.utils'

// consts
import { CouncilsFormsIds } from 'providers/CouncilProvider/helpers/council.types'
import { BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { BYTES_ADDRESS_TYPE, BYTES_STRING_TYPE, convertBytes } from 'utils/bytesToString'
import { COUNCIL_ACTIONS_BODY_COLUMS_MAPPER } from './CouncilAction.consts'
import { CAPITALIZE_CASE, parseCamelCaseString } from 'utils/parse'
import CustomLink from 'app/App.components/CustomLink/CustomLink'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

type Props = {
  councilAction: CouncilActionType
  isBreakGlassCounsil: boolean
  handleDropAction: (actionId: number) => void
}

export const CouncilOngoingAction = ({ councilAction, handleDropAction, isBreakGlassCounsil }: Props) => {
  const { id, actionName, councilSize, startDatetime, signersCount, parameters } = councilAction

  const cardActionId = getClientActionIdByName(actionName)
  if (!cardActionId) return null

  const bodyCells = getCouncilCardBodyCells(parameters, cardActionId, isBreakGlassCounsil, id)

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
        <CouncilActionBodyStyled cardActionId={cardActionId}>
          {bodyCells.map(({ className, value, name }) => {
            return (
              <div className={classNames('column', className)}>
                <div className="name">{name}</div>
                <div className="value" title={value}>
                  {className === 'member-url' ? (
                    <CustomLink to={value}>{value}</CustomLink>
                  ) : className === 'member-address' || className === 'old-member-address' ? (
                    <TzAddress tzAddress={value} hasIcon />
                  ) : className === 'member-image' ? (
                    <ImageWithPlug imageLink={value} alt={name} />
                  ) : (
                    value
                  )}
                </div>
              </div>
            )
          })}
          <div className="drop-btn">
            <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={() => handleDropAction(id)}>
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
  cardActionId: CouncilsFormsIds,
  isBreakGlassCounsil: boolean,
  actionId: number,
): Array<{ className: string; name: string; value: string }> => {
  // for those action show allowed params
  if (
    cardActionId === MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER ||
    cardActionId === BgCounsilDdForms.BG_REMOVE_COUNCIL_MEMBER ||
    cardActionId === MavrykCounsilDdForms.ADD_COUNCIL_MEMBER ||
    cardActionId === MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER ||
    cardActionId === BgCounsilDdForms.BG_ADD_COUNCIL_MEMBER ||
    cardActionId === BgCounsilDdForms.BG_CHANGE_COUNCIL_MEMBER
  ) {
    return actionParams.reduce<Array<{ className: string; name: string; value: string }>>((acc, actionParam) => {
      const { name, value } = actionParam
      const convertedParamValue = convertBytes(
        value,
        name.toLowerCase().includes('address') ? BYTES_ADDRESS_TYPE : BYTES_STRING_TYPE,
      )
      const columnClassName = COUNCIL_ACTIONS_BODY_COLUMS_MAPPER[name]

      if (convertedParamValue && columnClassName) {
        acc.push({
          className: columnClassName,
          name: parseCamelCaseString(name, CAPITALIZE_CASE),
          value: convertedParamValue,
        })
      }
      return acc
    }, [])
  }

  // for all other actions show their id only
  return [
    {
      className: 'action-meta',
      name: isBreakGlassCounsil ? 'Break Glass Action ID' : 'Council Action ID',
      value: actionId.toString(),
    },
  ]
}

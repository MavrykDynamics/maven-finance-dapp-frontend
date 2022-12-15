import { TRANSPARENT } from '../Button/Button.constants'
import { Button } from '../Button/Button.controller'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { DropDown } from '../DropDown/DropDown.controller'
import Icon from '../Icon/Icon.view'
import { InputStatusType } from '../Input/Input.constants'
import { Input, InputOneChange } from '../Input/Input.controller'
import { CustomTooltip } from '../Tooltip/Tooltip.view'
import { TzAddress } from '../TzAddress/TzAddress.view'
import { AddRowBtn, RemoveRowBtn, TableStyled } from './Table.style'

type DropDownPropsType = {
  dropDownItems: Array<string>
  isOpen: boolean
  clickOnDropDown: (rowIdx: number) => () => void
  clickOnItem: (rowIdx: number) => (value: string) => void
  setIsOpen: (newState: Array<boolean>) => void
}

type InputPropsType = {
  onChange: any
  onBlur: any
  onFocus?: InputOneChange
  name: string
  type: string
  placeholder?: string
  disabled?: boolean
}

export type TableProps = {
  className?: string
  colunmNames: Array<string>
  data: Array<Record<string, any>>
  addRowHandler: () => void
  removeRowHandler: (rowId: number) => void
  fieldsMapper: Array<{
    fieldName: string
    isDropDown?: boolean
    dropDownProps?: DropDownPropsType
    isInput?: boolean
    inputAttrs?: InputPropsType
    needCommaNumber?: boolean
    needTzAddress?: boolean
    propsToComponents?: Record<string, unknown>
    callback?: (fieldName: string, arg: unknown) => JSX.Element
  }>
}

const Table = ({ colunmNames, className, data, fieldsMapper }: TableProps) => {
  const rowsAmount = Math.floor((fieldsMapper.length + data.length * fieldsMapper.length) / fieldsMapper.length)
  return (
    <TableStyled className={`full-table ${className}`} columns={fieldsMapper.length}>
      <div className="row column-names">
        {colunmNames.map((name, idx) => (
          <div
            className={`row-item ${
              idx === 0 ? 'roundTopLeft' : idx === fieldsMapper.length - 1 ? 'roundTopRight' : ''
            }`}
            key={`${name}-${idx}`}
          >
            {name}
          </div>
        ))}
      </div>

      <div className="table-content scroll-block">
        {data.map((item, rowIdx) => {
          return (
            <div className="row" key={`${item.id}-${rowIdx}`}>
              {fieldsMapper.map(
                (
                  {
                    fieldName,
                    needCommaNumber,
                    isInput,
                    inputAttrs,
                    needTzAddress,
                    isDropDown,
                    dropDownProps,
                    callback,
                    propsToComponents = {},
                  },
                  columnIdx,
                ) => {
                  if (item?.[fieldName] === undefined) return null
                  const roundBorder =
                    (rowIdx = rowsAmount) && columnIdx === 0
                      ? 'roundBottomLeft'
                      : columnIdx === fieldsMapper.length - 1
                      ? 'roundBottomRight'
                      : ''

                  if (isInput && inputAttrs) {
                    return (
                      <div className={`input-cell row-item ${roundBorder}`}>
                        <Input
                          value={item[fieldName] ?? ''}
                          {...inputAttrs}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => inputAttrs.onChange(e, rowIdx - 2)}
                          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => inputAttrs.onBlur(e, rowIdx - 2)}
                          inputStatus={(item[fieldName + 'Validation'] as InputStatusType) ?? undefined}
                        />
                      </div>
                    )
                  }

                  if (isDropDown && dropDownProps) {
                    const dropDownItems = dropDownProps.dropDownItems ?? item[fieldName + 'Props']?.dropDownItems
                    const isOpen = dropDownProps.isOpen ?? item[fieldName + 'Props']?.isDropOpen

                    return (
                      <div className={`input-cell row-item ${roundBorder}`}>
                        <DropDown
                          placeholder={''}
                          items={dropDownItems}
                          setIsOpen={(newDropDownState) =>
                            dropDownProps.setIsOpen(
                              Array.from({ length: rowsAmount }, (_, idx) =>
                                idx === rowIdx - 2 ? newDropDownState : false,
                              ),
                            )
                          }
                          clickOnItem={dropDownProps.clickOnItem(rowIdx - 2)}
                          isOpen={isOpen}
                          className="stage-3-dropDown"
                          itemSelected={String(item[fieldName])}
                        />
                      </div>
                    )
                  }

                  if (callback) {
                    return (
                      <div className={`row-item ${roundBorder}`} key={item[fieldName] + fieldName}>
                        {callback(fieldName, item)}
                      </div>
                    )
                  }

                  if (needCommaNumber) {
                    return (
                      <div className={`row-item ${roundBorder}`} key={item[fieldName] + fieldName}>
                        <CommaNumber {...propsToComponents} value={Number(item[fieldName])} />
                      </div>
                    )
                  }

                  if (needTzAddress) {
                    return (
                      <div className={`row-item ${roundBorder}`} key={item[fieldName] + fieldName}>
                        <TzAddress hasIcon {...propsToComponents} tzAddress={String(item[fieldName])} />
                      </div>
                    )
                  }

                  return (
                    <div className={`row-item ${roundBorder}`} key={item[fieldName] + fieldName}>
                      {item[fieldName]}
                    </div>
                  )
                },
              )}

              <RemoveRowBtn className="button-wrap remove">
                <CustomTooltip text="Delete row">
                  <button type="button">
                    <Icon id="delete" />
                  </button>
                </CustomTooltip>
              </RemoveRowBtn>
            </div>
          )
        })}
      </div>

      <AddRowBtn className="button-wrap add">
        <CustomTooltip text="Insert 1 row below">
          <button type="button">+</button>
        </CustomTooltip>
      </AddRowBtn>
    </TableStyled>
  )
}

export default Table

import Icon from '../Icon/Icon.view'
import { CustomTooltip } from '../Tooltip/Tooltip.view'
import { AddRowBtn, RemoveRowBtn, TableStyled } from './Table.style'
import { CellType, CommaNumberPropsType, DropDownPropsType, InputPropsType, TableCell } from './TableCell'

export type TableProps = {
  className?: string
  colunmNames: Array<string>
  data: Array<
    Array<{
      cellValue: string | number
      cellType: CellType
      inputProps?: InputPropsType
      dropDownProps?: DropDownPropsType
      commaNumberProps?: CommaNumberPropsType
    }>
  >
  addRowHandler: () => void
  removeRowHandler: (rowId: number) => void
}

const Table = ({ colunmNames, className, data, addRowHandler, removeRowHandler }: TableProps) => {
  const columnsAmount = data[0]?.length ?? 0
  return (
    <TableStyled className={`full-table ${className}`} columns={columnsAmount}>
      <tr className="column-names">
        {colunmNames.map((name, columnIdx) => (
          <th
            className={`row-item ${columnIdx === columnsAmount - 1 ? 'no-right-border' : 'right-border'}`}
            key={`${name}-${columnIdx}`}
          >
            {name}
          </th>
        ))}
      </tr>

      {data.map((rowData, rowIdx) => {
        return (
          <tr>
            {rowData.map((cellData, columnIdx) => {
              return (
                <TableCell
                  key={`${cellData.cellType}-${rowIdx}-${columnIdx}`}
                  cellType={cellData.cellType}
                  cellValue={cellData.cellValue}
                  inputProps={cellData.inputProps}
                  dropDownProps={cellData.dropDownProps}
                  commaNumberProps={cellData.commaNumberProps}
                  rowIdx={rowIdx}
                  className={`${columnIdx === columnsAmount - 1 ? 'no-right-border' : 'right-border'} ${'top-border'}`}
                />
              )
            })}

            <RemoveRowBtn className="button-wrap remove" onClick={() => removeRowHandler(rowIdx)}>
              <CustomTooltip text="Delete row">
                <Icon id="delete" />
              </CustomTooltip>
            </RemoveRowBtn>
          </tr>
        )
      })}

      {/* <div className="table-content scroll-block">
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
      </div> */}

      <AddRowBtn className="button-wrap add" onClick={addRowHandler}>
        <CustomTooltip text="Insert 1 row below">
          <span>+</span>
        </CustomTooltip>
      </AddRowBtn>
    </TableStyled>
  )
}

export default Table

import Icon from '../Icon/Icon.view'
import { CustomTooltip } from '../Tooltip/Tooltip.view'
import { AddRowBtn, RemoveRowBtn, TableStyled } from './Table.style'
import { CellType, CommaNumberPropsType, DropDownPropsType, InputPropsType, TableCell } from './TableCell'

export type TableProps = {
  className?: string
  isTableDisabled?: boolean
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

const Table = ({
  colunmNames,
  className,
  data,
  addRowHandler,
  removeRowHandler,
  isTableDisabled = false,
}: TableProps) => {
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

            <RemoveRowBtn
              className={`button-wrap remove ${isTableDisabled ? 'disabled' : ''}`}
              {...(!isTableDisabled ? { onClick: () => removeRowHandler(rowIdx) } : {})}
            >
              <CustomTooltip text="Delete row">
                <Icon id="delete" />
              </CustomTooltip>
            </RemoveRowBtn>
          </tr>
        )
      })}

      <AddRowBtn
        className={`button-wrap add ${isTableDisabled ? 'disabled' : ''}`}
        {...(!isTableDisabled ? { onClick: addRowHandler } : {})}
      >
        <CustomTooltip text="Insert 1 row below">
          <span>+</span>
        </CustomTooltip>
      </AddRowBtn>
    </TableStyled>
  )
}

export default Table

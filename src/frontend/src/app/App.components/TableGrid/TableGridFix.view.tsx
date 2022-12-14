import { useState } from 'react'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { CustomTooltip } from '../../../app/App.components/Tooltip/Tooltip.view'

// const
import { PAYMENTS_TYPES } from 'pages/ProposalSubmission/ProposalSubmition.helpers'

// types
import type { TableListType } from './TableGrid.types'

// style
import { TableGridWrap } from './TableGrid.style'
import {
  DropDownListContainer,
  DropDownList,
  DropDownListItem,
} from '../../../app/App.components/DropDown/DropDown.style'

type Props = {
  tableData: TableListType
  setTableData: (arg0: TableListType) => void
}

const MAX_ROWS = 10
const TOKEN_TYPES = ['FA12', 'FA2', 'TEZ']

// TODO: remove this table make utility component for full table
export default function TableGridFix({ tableData, setTableData }: Props) {
  const [openDrop, setOpenDrop] = useState('')

  const isMaxRows = MAX_ROWS <= tableData.length

  const handleChangeData = (value: string, i: number, j: number) => {
    const cloneTable = [...tableData]
    cloneTable[i][j] = value
    setTableData(cloneTable)
    setOpenDrop('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number, j: number) => {
    const value = e.target.value
    handleChangeData(value, i, j)
  }

  const handleAddRow = () => {
    setOpenDrop('')
    const newFillRow = ['', '', TOKEN_TYPES[0]]
    setTableData([...tableData, newFillRow])
  }

  const handleDeleteRow = (i: number) => {
    setOpenDrop('')
    const newTable = tableData.filter((_, index) => index !== i)
    setTableData(newTable)
  }

  const handleToggleDrop = (i: number, j: number) => {
    if (openDrop) {
      setOpenDrop('')
    } else {
      setOpenDrop(`${i}-${j}`)
    }
  }

  return (
    <TableGridWrap>
      <div className="table-wrap">
        <table>
          {tableData.map((row, i) => (
            <tr key={i}>
              {row.map((colValue, j) => {
                const isFirstRow = i === 0
                const isLastColumn = !isFirstRow && j === 2
                const isOpen = openDrop === `${i}-${j}`

                return (
                  <td key={`${i}+${j}`}>
                    {isFirstRow ? (
                      colValue
                    ) : !isLastColumn ? (
                      <input
                        onFocus={() => setOpenDrop('')}
                        required
                        value={colValue}
                        type={j === 1 ? 'number' : 'text'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, i, j)}
                      />
                    ) : (
                      <div className="table-drop">
                        <button type="button" onClick={() => handleToggleDrop(i, j)} className="table-drop-btn-cur">
                          {colValue}
                        </button>
                        {isOpen && (
                          <DropDownListContainer>
                            <DropDownList>
                              {PAYMENTS_TYPES.map((value, index) => {
                                const isActive = colValue === value
                                return (
                                  <DropDownListItem onClick={() => handleChangeData(value, i, j)} key={Math.random()}>
                                    {value} {isActive ? <Icon id="check-stroke" /> : null}
                                  </DropDownListItem>
                                )
                              })}
                            </DropDownList>
                          </DropDownListContainer>
                        )}
                      </div>
                    )}

                    {isLastColumn && tableData.length > 2 ? (
                      <div className="delete-button-wrap">
                        <CustomTooltip text="Delete row">
                          <button type="button" onClick={() => handleDeleteRow(i)}>
                            <Icon id="delete" />
                          </button>
                        </CustomTooltip>
                      </div>
                    ) : null}
                  </td>
                )
              })}
            </tr>
          ))}
        </table>
      </div>
      {!isMaxRows ? (
        <CustomTooltip text="Insert 1 row below" className="btn-add-row">
          <button type="button" className="btn-add-row" onClick={handleAddRow}>
            +
          </button>
        </CustomTooltip>
      ) : null}
    </TableGridWrap>
  )
}

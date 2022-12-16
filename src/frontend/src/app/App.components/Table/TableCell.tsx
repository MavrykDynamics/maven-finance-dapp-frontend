import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { DropDown } from '../DropDown/DropDown.controller'
import { InputStatusType } from '../Input/Input.constants'
import { Input, InputOneChange } from '../Input/Input.controller'
import { BLUE } from '../TzAddress/TzAddress.constants'
import { TzAddress } from '../TzAddress/TzAddress.view'

export type DropDownPropsType = {
  items: Array<string>
  isOpen: boolean
  disabled?: boolean
  clickOnItem: (rowIdx: number) => (value: string) => void
  setIsOpen: (newState: Array<boolean>) => void
}

export type CommaNumberPropsType = {
  decimalsToShow?: number
  endingText?: string
  beginningText?: string
  showDecimal?: boolean
  useAccurateParsing?: boolean
}

export type InputPropsType = {
  onChange: any
  onBlur: any
  onFocus?: InputOneChange
  name: string
  type: string
  placeholder?: string
  inputStatus?: InputStatusType
  disabled?: boolean
}

export type CellType = 'input' | 'dropDown' | 'text' | 'commaNumber' | 'tzAddress'

type TableCellPropsType = {
  cellType: CellType
  cellValue: string | number
  inputProps?: InputPropsType
  dropDownProps?: DropDownPropsType
  commaNumberProps?: {}
  rowIdx: number
  className?: string
}

export const TableCell = ({
  cellType,
  cellValue,
  commaNumberProps,
  dropDownProps,
  inputProps,
  rowIdx,
  className = '',
}: TableCellPropsType) => {
  if (cellType === 'input' && inputProps) {
    return (
      <td className={className}>
        <Input
          value={cellValue}
          {...inputProps}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => inputProps.onChange(e, rowIdx)}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => inputProps.onBlur(e, rowIdx)}
        />
      </td>
    )
  }

  if (cellType === 'dropDown' && dropDownProps) {
    return (
      <td className={className}>
        <DropDown
          placeholder={''}
          {...dropDownProps}
          itemSelected={String(cellValue)}
          setIsOpen={(newDropDownState) =>
            dropDownProps.setIsOpen(dropDownProps.items.map((_, idx) => (idx === rowIdx ? newDropDownState : false)))
          }
          clickOnItem={dropDownProps.clickOnItem(rowIdx)}
          className="stage-3-dropDown"
        />
      </td>
    )
  }

  if (cellType === 'commaNumber') {
    return (
      <td className={className}>
        <CommaNumber value={Number(cellValue)} {...commaNumberProps} />
      </td>
    )
  }

  if (cellType === 'tzAddress') {
    return (
      <td className={className}>
        <TzAddress tzAddress={cellValue.toString()} type={BLUE} hasIcon={true} className="table-cell-tzAddress" />
      </td>
    )
  }

  return (
    <td className={className}>
      <span>{cellValue}</span>
    </td>
  )
}

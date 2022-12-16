import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { DropDown } from '../DropDown/DropDown.controller'
import { InputStatusType } from '../Input/Input.constants'
import { Input, InputOneChange } from '../Input/Input.controller'
import { TzAddress } from '../TzAddress/TzAddress.view'

export type DropDownPropsType = {
  items: Array<string>
  isOpen: boolean
  clickOnDropDown: (rowIdx: number) => () => void
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

export type CellType = 'input' | 'dropdown' | 'text' | 'commaNumber' | 'tzAddress'

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

  if (cellType === 'dropdown' && dropDownProps) {
    return (
      <td className={className}>
        {/* <DropDown
          placeholder={''}
          items={dropDownProps.dropDownItems}
          setIsOpen={(newDropDownState) =>
            dropDownProps.setIsOpen(
              Array.from({ length: rowsAmount }, (_, idx) => (idx === rowIdx - 2 ? newDropDownState : false)),
            )
          }
          clickOnItem={dropDownProps.clickOnItem(rowIdx - 2)}
          isOpen={isOpen}
          className="stage-3-dropDown"
          itemSelected={String(item[fieldName])}
        /> */}
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
        <TzAddress tzAddress={cellValue.toString()} />
      </td>
    )
  }

  return (
    <td className={className}>
      <span>{cellValue}</span>
    </td>
  )
}

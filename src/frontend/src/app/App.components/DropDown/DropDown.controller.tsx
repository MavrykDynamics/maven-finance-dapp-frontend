import { DropDownView } from './DropDown.view'

type DropDownProps = {
  placeholder: string
  items: readonly string[]
  clickOnDropDown?: () => void
  clickOnItem: (value: string) => void
  isOpen: boolean
  disabled?: boolean
  setIsOpen: (arg: boolean) => void
  itemSelected: string | undefined
  className?: string
}

export type DropdownItemType = {
  text: string
  value: string
}

export const DropDown = ({
  placeholder,
  items,
  isOpen,
  setIsOpen,
  itemSelected,
  clickOnItem,
  className,
  disabled,
}: DropDownProps) => {
  return (
    <DropDownView
      placeholder={placeholder}
      isOpen={isOpen}
      items={items}
      disabled={disabled}
      itemSelected={itemSelected}
      clickItem={clickOnItem}
      setIsOpen={setIsOpen}
      className={className}
    />
  )
}

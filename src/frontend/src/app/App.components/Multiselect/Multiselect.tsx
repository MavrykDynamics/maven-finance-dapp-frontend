import classNames from 'classnames'
import Select from 'react-select'
import { useEffect, useRef, useState } from 'react'
import { useClickAway } from 'react-use'

import { scrollToFullView } from 'utils/scrollToFullView'
import { MultiselectStyled } from './Multiselect.style'

// Default Multiselect item type, and those properties are required, if we need to search by some other fields specify this fieds as an addition to required
export type MultiselectItemType = {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

// Common props type for Multiselect component
type CommonProps<ItemType extends MultiselectItemType> = {
  options: Array<ItemType>
  selectHandler: (item: ReadonlyArray<ItemType>) => void
  // selectAllHandler: () => void
  disabled?: boolean
  placeholder: string
}

// Props type for Multiselect without search
type RegularMultiselect<ItemType extends MultiselectItemType> = CommonProps<ItemType> & {
  withSearch?: never
  searchHandler?: never
}

// Props type for Multiselect with search
type SearchMultiselect<ItemType extends MultiselectItemType> = CommonProps<ItemType> & {
  withSearch: true
  searchHandler: (searchString: string) => void
}

// Final Multiselect props type
type MultiselectProps<ItemType extends MultiselectItemType> = RegularMultiselect<ItemType> | SearchMultiselect<ItemType>

export const Multiselect = <ItemType extends MultiselectItemType = MultiselectItemType>({
  options,
  selectHandler,
  // selectAllHandler,
  disabled,
  placeholder,
  // search props
  withSearch,
  searchHandler,
}: MultiselectProps<ItemType>) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false)

  const multiselectBodyRef = useRef<HTMLDivElement | null>(null)
  const multiselectRef = useRef<HTMLDivElement | null>(null)

  useClickAway(multiselectRef, () => setIsDropDownOpen(false))

  // if the dropdown is not fully visible in the window,
  // move the scroll to fix it
  useEffect(() => {
    if (isDropDownOpen) scrollToFullView(multiselectBodyRef.current)
  }, [isDropDownOpen])

  return (
    <MultiselectStyled>
      <Select
        onChange={selectHandler}
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable={withSearch}
        isMulti
      />
    </MultiselectStyled>
    // <MultiselectStyled ref={multiselectRef}>
    //   <MultiselectHeaderStyled></MultiselectHeaderStyled>
    //   <MultiselectBodyStyled ref={multiselectBodyRef}>
    //     {items.map(({ id, disabled, content }) => {
    //       ;<MultiselectItemStyled key={id} className={classNames({ disabled })}>
    //         {content}
    //       </MultiselectItemStyled>
    //     })}
    //   </MultiselectBodyStyled>
    // </MultiselectStyled>
  )
}

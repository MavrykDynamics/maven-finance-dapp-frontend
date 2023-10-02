import Select, { ActionMeta, FormatOptionLabelMeta } from 'react-select'

import { MultiselectStyled } from './Multiselect.style'
import { MULTISELECT_SELECT_ALL_OPTION_VALUE } from './Multiselect.consts'

// Default Multiselect item type, and those properties are required, if we need to search by some other fields specify this fieds as an addition to required
export type MultiselectItemType = {
  value: string
  label: string
  image?: string
}

// Common props type for Multiselect component
type CommonProps<ItemType extends MultiselectItemType> = {
  options: Array<ItemType>
  selectedOptions: Array<ItemType>
  selectHandler: (item: ReadonlyArray<ItemType>, actionMeta?: ActionMeta<ItemType>) => void
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
  selectedOptions,
  selectHandler,
  // selectAllHandler,
  disabled,
  placeholder,
  // search props
  withSearch,
  searchHandler,
}: MultiselectProps<ItemType>) => {
  const handleSelect = (newSelectedOptions: ReadonlyArray<ItemType>, actionMeta: ActionMeta<ItemType>) => {
    const { action, option, removedValue, removedValues } = actionMeta

    console.log({ action, option, removedValue, removedValues })

    // handle togle 'all' option
    if (
      (option && option.value === MULTISELECT_SELECT_ALL_OPTION_VALUE) ||
      (removedValue && removedValue.value === MULTISELECT_SELECT_ALL_OPTION_VALUE)
    ) {
      if (action === 'select-option') {
        selectHandler(options, actionMeta)
        return
      } else if (action === 'deselect-option' || action === 'remove-value') {
        selectHandler([], actionMeta)
        return
      }
    }

    const isAllOptionsSelected =
      newSelectedOptions.filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE).length ===
      options.filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE).length

    if (isAllOptionsSelected) {
      // when we selected last option, we need to mark 'all' as selected too
      if (action === 'select-option') {
        selectHandler(
          newSelectedOptions.concat(options.find(({ value }) => value === MULTISELECT_SELECT_ALL_OPTION_VALUE) ?? []),
          actionMeta,
        )
        return
      }
      // if we have selected all options, we need to remove selection from 'all' option on deselect
      else if (action === 'deselect-option' || action === 'remove-value') {
        selectHandler(
          newSelectedOptions.filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE),
          actionMeta,
        )
        return
      }
    }

    selectHandler(newSelectedOptions, actionMeta)
  }

  const checkWhetherOptionIsSelected = (option: ItemType) => {
    return Boolean(selectedOptions.find(({ value }) => value === option.value))
  }

  const formatOptionLabel = (data: ItemType, formatOptionLabelMeta: FormatOptionLabelMeta<ItemType>) => {
    console.log({ data, formatOptionLabelMeta })

    return data.label
  }

  return (
    <MultiselectStyled>
      <Select
        value={selectedOptions}
        onChange={handleSelect}
        options={options}
        isOptionSelected={checkWhetherOptionIsSelected}
        formatOptionLabel={formatOptionLabel}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable={withSearch}
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        menuShouldBlockScroll
        menuShouldScrollIntoView
        controlShouldRenderValue
        isMulti
      />
    </MultiselectStyled>
  )
}

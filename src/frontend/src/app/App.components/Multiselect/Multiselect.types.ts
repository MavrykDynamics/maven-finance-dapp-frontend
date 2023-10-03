import { ActionMeta } from 'react-select'

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
  disabled?: boolean
  placeholder: string
}

// Props type for Multiselect without search
type RegularMultiselect<ItemType extends MultiselectItemType> = CommonProps<ItemType> & {
  withSearch?: never
  searchPlaceholder?: never
  searchHandler?: never
}

// Props type for Multiselect with search
type SearchMultiselect<ItemType extends MultiselectItemType> = CommonProps<ItemType> & {
  withSearch: true
  searchPlaceholder: string
  searchHandler: (searchString: string) => void
}

// Final Multiselect props type
export type MultiselectProps<ItemType extends MultiselectItemType> =
  | RegularMultiselect<ItemType>
  | SearchMultiselect<ItemType>

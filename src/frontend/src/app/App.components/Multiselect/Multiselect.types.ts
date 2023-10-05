import { ActionMeta } from 'react-select'

// Default Multiselect item type, and those properties are required, if we need to search by some other fields specify this fieds as an addition to required
export type MultiselectItemType = {
  value: string
  label: string
  image?: string
}

// Multiselect props type
export type MultiselectProps<ItemType extends MultiselectItemType> = {
  options: Array<ItemType>
  selectedOptions: Array<ItemType>
  selectHandler: (item: ReadonlyArray<ItemType>, actionMeta?: ActionMeta<ItemType>) => void
  searchHandler?: (option: ItemType, searchString: string) => boolean
  disabled?: boolean
  isLoading?: boolean
  placeholder: string
}

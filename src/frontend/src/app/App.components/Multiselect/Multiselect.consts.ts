import { DeselectOptionActionMeta, RemoveValueActionMeta, SelectOptionActionMeta } from 'react-select'
import { MultiselectItemType } from './Multiselect.types'

export const MULTISELECT_SELECT_ALL_OPTION_VALUE = 'SELECT_ALL'

// actions names from react-select lib
export const MULTISELECT_ACTION_SELECT: SelectOptionActionMeta<MultiselectItemType>['action'] = 'select-option'
export const MULTISELECT_ACTION_REMOVE: RemoveValueActionMeta<MultiselectItemType>['action'] = 'remove-value'
export const MULTISELECT_ACTION_DESELECT: DeselectOptionActionMeta<MultiselectItemType>['action'] = 'deselect-option'

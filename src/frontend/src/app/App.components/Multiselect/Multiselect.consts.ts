import {
  DeselectOptionActionMeta,
  GroupBase,
  RemoveValueActionMeta,
  SelectOptionActionMeta,
  StylesConfig,
} from 'react-select'
import { ThemeColorsType } from 'styles'
import { MultiselectItemType } from './Multiselect.types'

export const MULTISELECT_SELECT_ALL_OPTION_VALUE = 'SELECT_ALL'

// actions names from react-select lib
export const MULTISELECT_ACTION_SELECT: SelectOptionActionMeta<MultiselectItemType>['action'] = 'select-option'
export const MULTISELECT_ACTION_REMOVE: RemoveValueActionMeta<MultiselectItemType>['action'] = 'remove-value'
export const MULTISELECT_ACTION_DESELECT: DeselectOptionActionMeta<MultiselectItemType>['action'] = 'deselect-option'

export const getMultiselectStyling = <ItemType extends MultiselectItemType>(
  themeColors: ThemeColorsType,
): StylesConfig<ItemType, true, GroupBase<ItemType>> => {
  return {
    menu(baseStyles) {
      return {
        ...baseStyles,
        backgroundColor: themeColors.cards,
        border: `1px solid ${themeColors.strokeColor}`,
        borderTop: 'none',
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        margin: '0',
      }
    },
    menuList(baseStyles) {
      return {
        ...baseStyles,
        width: '100%',
        padding: '0 8px 8px 8px',
        rowGap: '6px',
        maxHeight: '350px',
        overflowY: 'auto',
      }
    },
    // to remove default active and hover from options in menu, we use styled component for this purposes
    option() {
      return {}
    },
  }
}

import { GroupBase, StylesConfig } from 'react-select'
import { ThemeColorsType } from 'styles'
import { MultiselectItemType } from './Multiselect.types'

export const MULTISELECT_SELECT_ALL_OPTION_VALUE = 'SELECT_ALL'

export const getMultiselectStyling = <ItemType extends MultiselectItemType>(
  themeColors: ThemeColorsType,
): StylesConfig<ItemType, true, GroupBase<ItemType>> => {
  return {
    menu(baseStyles, props) {
      return {
        ...baseStyles,
        backgroundColor: themeColors.backgroundColor,
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
    menuList(baseStyles, props) {
      return {
        ...baseStyles,
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        padding: '0 8px 8px 8px',
        rowGap: '6px',
        maxHeight: '400px',
        overflowY: 'auto',
      }
    },
    option(baseStyles, props) {
      return {}
    },
  }
}

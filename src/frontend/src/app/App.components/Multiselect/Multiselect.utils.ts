import { GroupBase, StylesConfig } from 'react-select'
import { ThemeColorsType } from 'styles'
import { MultiselectItemType } from './Multiselect.types'

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

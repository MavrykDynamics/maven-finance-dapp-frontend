import { useCallback } from 'react'

// view
import { MenuView } from './Menu.view'

import { usePreferencesContext } from 'providers/PreferencesProvider/preferences.provider'

export const Menu = () => {
  const { toggleRPCNodePopup } = usePreferencesContext()
  const openChangeNodePopup = useCallback(() => toggleRPCNodePopup(true), [])

  return <MenuView openChangeNodePopupHandler={openChangeNodePopup} />
}

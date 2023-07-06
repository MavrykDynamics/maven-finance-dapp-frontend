import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

// view
import { MenuView } from './Menu.view'

// actions
import { toggleRPCNodePopup } from '../SettingsPopup/SettingsPopup.actions'

export const Menu = () => {
  const dispatch = useDispatch()
  const openChangeNodePopup = useCallback(() => dispatch(toggleRPCNodePopup(true)), [])

  return <MenuView openChangeNodePopupHandler={openChangeNodePopup} />
}

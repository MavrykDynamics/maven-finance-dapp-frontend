import { useCallback } from 'react'

// view
import { MenuView } from './Menu.view'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export const Menu = () => {
  const { toggleRPCNodePopup } = useDappConfigContext()
  const openChangeNodePopup = useCallback(() => toggleRPCNodePopup(true), [])

  return <MenuView openChangeNodePopupHandler={openChangeNodePopup} />
}

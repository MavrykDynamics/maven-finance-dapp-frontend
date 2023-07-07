import { getItemFromStorage } from 'utils/storage'
import { PreferencesState } from '../preferences.provider.types'

// preferences
export const mariGoldUrl = 'https://ghostnet.tezos.marigold.dev/'
export const ecadLabSUrl = 'https://ghostnet.ecadinfra.com'

export const RPC_NODE = 'selectedRpcNode'

export const preferencesDefaultState: PreferencesState = {
  themeSelected: getItemFromStorage('theme') || 'space',
  changeNodePopupOpen: false,
  sidebarOpened: false,
  RPC_NODES: [
    { title: 'ECADLABS', url: ecadLabSUrl, nodeLogoUrl: 'ECAD_logo.png', isUser: false },
    { title: 'MARIGOLD', url: mariGoldUrl, nodeLogoUrl: 'marigold_logo.png', isUser: false },
  ],
  REACT_APP_RPC_PROVIDER: ecadLabSUrl,
}

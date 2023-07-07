import { ThemeType } from 'app/App.components/DarkThemeProvider/DarkThemeProvider.actions'

export type HeadDataType = {
  knownLevel: number
  level: number
}

export type RPCNodeType = {
  url: string
  title: string
  nodeLogoUrl?: string
  isUser: boolean
}

export type PreferencesState = {
  themeSelected: ThemeType
  headData?: HeadDataType
  changeNodePopupOpen: boolean
  RPC_NODES: Array<RPCNodeType>
  REACT_APP_RPC_PROVIDER: string
  sidebarOpened: boolean
}

export type PreferencesContext = PreferencesState & {
  toggleTheme: (theme: ThemeType) => void
  getHeadData: () => void
  toggleRPCNodePopup: (isOpened: boolean) => void
  selectNewRPCNode: (newRPCNode: string, isRemove?: boolean) => void
  setNewRPCNodes: (newRPCNodes: Array<RPCNodeType>, isRemove?: boolean) => void
  toggleSidebarCollapsing: (isOpened?: boolean) => void
}

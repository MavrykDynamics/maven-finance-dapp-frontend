import { usePreferencesContext } from 'providers/PreferencesProvider/preferences.provider'
import { ThemeProvider } from 'styled-components'
import themeColors from 'styles/colors'

const DarkThemeProvider = ({ children }: { children?: JSX.Element | Array<JSX.Element> }) => {
  const { themeSelected } = usePreferencesContext()
  return <ThemeProvider theme={themeColors[themeSelected]}>{children}</ThemeProvider>
}

export default DarkThemeProvider

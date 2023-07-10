import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { ThemeProvider } from 'styled-components'
import themeColors from 'styles/colors'

const DarkThemeProvider = ({ children }: { children?: JSX.Element | Array<JSX.Element> }) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  return <ThemeProvider theme={themeColors[themeSelected]}>{children}</ThemeProvider>
}

export default DarkThemeProvider

import { useCallback } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
// components
import { ErrorTopbar } from './components/ErrorTopbar'
import { ErrorFooter } from './components/ErrorFooter'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
// consts
import { errorDescDefaultText, errorHeaderDefaultText } from 'providers/ToasterProvider/toaster.provider.const'
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
// styles
import {
  ErrorPageWrapper,
  ErrorPageInner,
  ErrorTopHeader,
  ErrorMidHeader,
  ErrorParagraph,
  ErrorLogoImage,
  Vector1,
  Vector2,
} from './ErrorPage.style'
import themeColors from 'styles/colors'

// providers
import { store } from 'app/App.controller'
import { ThemeProvider } from 'styled-components'
import { SPACE_THEME } from 'app/App.components/DarkThemeProvider/DarkThemeProvider.actions'
import { Provider } from 'react-redux'

type ErrorPageProps = {
  headerText?: string
  descText?: string | JSX.Element
}

export const ErrorPage = ({ headerText = errorHeaderDefaultText, descText = errorDescDefaultText }: ErrorPageProps) => {
  const handleRedirect = useCallback(() => {
    window.location.assign('/')
  }, [])

  // TODO take theme from localStorage when the logic for themes will be done.
  const themeSelected = SPACE_THEME
  return (
    <Router>
      <ThemeProvider theme={themeColors[themeSelected]}>
        <ErrorPageWrapper>
          <ErrorTopbar handleRedirect={handleRedirect} />
          <ErrorPageInner>
            <ErrorTopHeader>Error</ErrorTopHeader>
            <Vector1 src="/images/satellite-error.svg" />
            <ErrorLogoImage src="/images/404.svg" alt="404-logo" />
            <Vector2 src="/images/space-cow.svg" />
            <ErrorMidHeader>{headerText}</ErrorMidHeader>
            <ErrorParagraph>{descText}</ErrorParagraph>
            {/* <NewButton kind={BUTTON_PRIMARY} onClick={handleRedirect}>
                <Icon id="menu-compass" />
                Go To Dashboard
              </NewButton> */}
          </ErrorPageInner>
          <ErrorFooter handleRedirect={handleRedirect} />
        </ErrorPageWrapper>
      </ThemeProvider>
    </Router>
  )
}

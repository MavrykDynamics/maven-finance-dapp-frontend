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
import { SPACE_THEME, ThemeType, themeSchema } from 'consts/theme.const'
import { ERROR_TYPE_FATAL, ERROR_TYPE_ROUTER } from 'errors/error.const'

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
import { ThemeProvider } from 'styled-components'
// types
import { InternalErrorType } from 'errors/error.type'
import { getItemFromStorage } from 'utils/storage'

type ErrorPageProps = {
  headerText?: string
  descText?: string | JSX.Element
  type?: InternalErrorType
}

export const ErrorPage = ({
  headerText = errorHeaderDefaultText,
  descText = errorDescDefaultText,
  type = ERROR_TYPE_FATAL,
}: ErrorPageProps) => {
  const themeSelected = getItemFromStorage<ThemeType>('theme', themeSchema) || SPACE_THEME

  const handleRedirect = useCallback(() => {
    window.location.assign('/')
  }, [])

  return (
    <Router>
      <ThemeProvider theme={themeColors[themeSelected]}>
        <ErrorPageWrapper themeSelected={themeSelected}>
          <ErrorTopbar handleRedirect={handleRedirect} />
          <ErrorPageInner>
            <ErrorTopHeader>Error</ErrorTopHeader>
            <Vector1 src="/images/satellite-error.svg" />
            <ErrorLogoImage src="/images/404.svg" alt="404-logo" />
            <Vector2 src="/images/space-cow.svg" />
            <ErrorMidHeader>{headerText}</ErrorMidHeader>
            <ErrorParagraph>{descText}</ErrorParagraph>
            {type === ERROR_TYPE_ROUTER && (
              <NewButton kind={BUTTON_PRIMARY} onClick={handleRedirect}>
                <Icon id="menu-compass" />
                Go To Dashboard
              </NewButton>
            )}
          </ErrorPageInner>
          <ErrorFooter handleRedirect={handleRedirect} />
        </ErrorPageWrapper>
      </ThemeProvider>
    </Router>
  )
}

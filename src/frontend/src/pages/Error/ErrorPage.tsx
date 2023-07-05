import { BrowserRouter as Router } from 'react-router-dom'
import NewButton from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import Icon from 'app/App.components/Icon/Icon.view'
import { errorDescDefaultText, errorHeaderDefaultText } from 'providers/ToasterProvider/toaster.provider.const'
import { ErrorFooter } from './components/ErrorFooter'
import { ErrorTopbar } from './components/ErrorTopbar'
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

type ErrorPageProps = {
  headerText?: string
  descText?: string | JSX.Element
}

export const ErrorPage = ({ headerText = errorHeaderDefaultText, descText = errorDescDefaultText }: ErrorPageProps) => {
  const handleRedirect = () => {
    window.location.assign('/')
  }

  return (
    <Router>
      <ErrorPageWrapper>
        <ErrorTopbar />
        <ErrorPageInner>
          <ErrorTopHeader>Error</ErrorTopHeader>
          <Vector1 src="/images/satellite-error.svg" />
          <ErrorLogoImage src="/images/404.svg" alt="404-logo" />
          <Vector2 src="/images/space-cow.svg" />
          <ErrorMidHeader>{headerText}</ErrorMidHeader>
          <ErrorParagraph>{descText}</ErrorParagraph>
          <NewButton kind={BUTTON_PRIMARY} onClick={handleRedirect}>
            <Icon id="menu-compass" />
            Go To Dashboard
          </NewButton>
        </ErrorPageInner>
        <ErrorFooter handleRedirect={handleRedirect} />
      </ErrorPageWrapper>
    </Router>
  )
}

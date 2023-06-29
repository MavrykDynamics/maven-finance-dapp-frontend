import React from 'react'
import { useHistory } from 'react-router-dom'
import NewButton from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY, BUTTON_ROUND } from 'app/App.components/Button/Button.constants'
import Icon from 'app/App.components/Icon/Icon.view'
import {
  ErrorPageWrapper,
  ErrorPageInner,
  ErrorTopHeader,
  ErrorMidHeader,
  ErrorParagraph,
  ErrorLogoImage,
} from './ErrorPage.style'

export const ErrorPage = () => {
  const history = useHistory()

  const handleRedirect = () => {
    history.push('/')
  }
  return (
    <ErrorPageWrapper>
      <ErrorPageInner>
        <ErrorTopHeader>Error</ErrorTopHeader>
        <ErrorLogoImage src="/images/404.png" alt="404-logo" />
        <ErrorMidHeader>This page is outside the universe </ErrorMidHeader>
        <ErrorParagraph>
          The page you are trying to access doesn’t exist or has been moved.
          <br /> Try going back to your Dashboard page
        </ErrorParagraph>
        <NewButton kind={BUTTON_PRIMARY} onClick={handleRedirect}>
          <Icon id="menu-compass" />
          Go To Dashboard
        </NewButton>
      </ErrorPageInner>
    </ErrorPageWrapper>
  )
}

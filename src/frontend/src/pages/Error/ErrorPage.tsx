import React, { useLayoutEffect } from 'react'
import NewButton from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import Icon from 'app/App.components/Icon/Icon.view'
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
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { errorDescDefaultText, errorHeaderDefaultText } from 'providers/ToasterProvider/toaster.provider.const'

type ErrorPageProps = {
  headerText?: string
  descText?: string | JSX.Element
}

export const ErrorPage = ({ headerText = errorHeaderDefaultText, descText = errorDescDefaultText }: ErrorPageProps) => {
  const { setIs404PageInView } = useToasterContext()

  const handleRedirect = () => {
    window.location.assign('/')
  }

  // set boolean value in context for 404 page to change styles in other components
  useLayoutEffect(() => {
    setIs404PageInView()

    // reset is404 on unmount
    return () => {
      setIs404PageInView(false)
    }
  }, [])

  return (
    <ErrorPageWrapper>
      <ErrorPageInner>
        <ErrorTopHeader>Error</ErrorTopHeader>
        <Vector1 src="/images/satellite-error.svg" />
        <ErrorLogoImage src="/images/404.png" alt="404-logo" />
        <Vector2 src="/images/space-cow.svg" />
        <ErrorMidHeader>{headerText}</ErrorMidHeader>
        <ErrorParagraph>{descText}</ErrorParagraph>
        <NewButton kind={BUTTON_PRIMARY} onClick={handleRedirect}>
          <Icon id="menu-compass" />
          Go To Dashboard
        </NewButton>
      </ErrorPageInner>
    </ErrorPageWrapper>
  )
}

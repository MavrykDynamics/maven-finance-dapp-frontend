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
  ErrorFooterWrapper,
  ErrorFooterMiddle,
  ErrorFooterRight,
} from './ErrorPage.style'
import { errorDescDefaultText, errorHeaderDefaultText } from 'providers/ToasterProvider/toaster.provider.const'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

type ErrorPageProps = {
  headerText?: string
  descText?: string | JSX.Element
}

export const ErrorPage = ({ headerText = errorHeaderDefaultText, descText = errorDescDefaultText }: ErrorPageProps) => {
  const handleRedirect = () => {
    window.location.assign('/')
  }

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
      <ErrorFooterWrapper>
        <span onClick={handleRedirect}>
          <ImageWithPlug plugSrc="/images/mavryk-logo-small.svg" alt="logo-small" />
        </span>
        <ErrorFooterMiddle>
          Powered by&nbsp;
          <a href="https://tzkt.io" target="_blank" rel="noreferrer">
            TzKT API
          </a>
          &nbsp; & &nbsp;
          <a href="https://dipdup.io" target="_blank" rel="noreferrer">
            DipDup
          </a>
        </ErrorFooterMiddle>
        <ErrorFooterRight>
          <a
            href="https://docs.google.com/document/d/1jW-XtRPv3TsCV2meV2ajgkQ6dI0iEwuz9xgZwnyMliw/edit"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>

          <a
            href="https://docs.google.com/document/d/1R0LA7CmVQjH7vr-FvWOy96LRxJ_XU3HXLXnqNZjZlJQ/edit"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Use
          </a>
        </ErrorFooterRight>
      </ErrorFooterWrapper>
    </ErrorPageWrapper>
  )
}

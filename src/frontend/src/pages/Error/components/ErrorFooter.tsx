import React from 'react'
import { ErrorFooterMiddle, ErrorFooterRight, ErrorFooterWrapper } from '../ErrorPage.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

type ErrorFooterProps = {
  handleRedirect: () => void
}

export const ErrorFooter = ({ handleRedirect }: ErrorFooterProps) => {
  return (
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
  )
}

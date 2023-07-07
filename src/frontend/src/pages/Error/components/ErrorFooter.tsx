import React from 'react'
import { ErrorFooterMiddle, ErrorFooterRight, ErrorFooterWrapper } from '../ErrorPage.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { mavrykLinks } from 'app/App.components/Footer/footer.const'

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
        {mavrykLinks.map(({ link, title }) => (
          <a key={link} href={link} target="_blank" rel="noreferrer">
            {title}
          </a>
        ))}
      </ErrorFooterRight>
    </ErrorFooterWrapper>
  )
}

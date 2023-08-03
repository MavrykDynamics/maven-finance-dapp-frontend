import React from 'react'
import { ErrorMenuTopStyled, ErrorTopbarLogo } from '../ErrorPage.style'
import {
  ABOUT_LINKS,
  BLOG_LINKS,
  DOCS_LINKS,
  PRODUCTS_LINKS,
} from 'app/App.components/Menu/MenuTopBar/MenuTopBar.controller'
import { TopBarLinks } from 'app/App.components/Menu/MenuTopBar/TopBarLinks/TopBarLinks.controller'

type ErrorTopbarProps = {
  handleRedirect: () => void
}

export const ErrorTopbar = ({ handleRedirect }: ErrorTopbarProps) => {
  return (
    <ErrorMenuTopStyled>
      <div className="left-side">
        <ErrorTopbarLogo alt="logo" className={'desktop-logo'} src="/logo-dark.svg" onClick={handleRedirect} />
      </div>
      <div className="grouped-links">
        <TopBarLinks groupName={'Products'} groupLinks={PRODUCTS_LINKS} />
        <TopBarLinks groupName={'About'} groupLinks={ABOUT_LINKS} />
        <TopBarLinks groupName={'Blog 🔥'} groupLinks={BLOG_LINKS} groupNameLink="https://blogs.mavryk.finance/" />
        <TopBarLinks groupName={'Docs'} groupLinks={DOCS_LINKS} />
      </div>
    </ErrorMenuTopStyled>
  )
}

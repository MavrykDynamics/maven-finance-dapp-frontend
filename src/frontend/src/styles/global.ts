import { createGlobalStyle } from 'styled-components/macro'
import { css } from 'styled-components'
import { MavrykTheme } from './interfaces'

export const GlobalStyle = createGlobalStyle<{ theme: MavrykTheme }>`
* {
  box-sizing: border-box;
}

body {
  font-family: 'Metropolis', Helvetica, Arial, sans-serif;
  font-display: optional;
  margin: 0;
  padding: 0;
  background-color: ${({ theme }) => theme.backgroundColor};
  color: ${({ theme }) => theme.regularText};
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-width: 1460px;
  width: calc(100vw - 16px);

  @media screen and (max-width: 1460px) {
    min-width: 1250px;
  }
}

h1, h2, h3, h4 {
  color: ${({ theme }) => theme.mainHeadingText};
  font-weight: normal;
}

h1, h2 {
  font-weight: bold;
  display: inline-block;
  margin: 30px auto;

  font-size: 22px;
  font-weight: 700;

  @media (max-width: 700px) {   
    font-size: 30px;
    margin: 20px auto;
  }

  &::after{
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: ${({ theme }) => theme.mainHeadingText};
    margin: 7px 0 10px 1px;
  }
}

h2 {
  display: block;
  margin: 0;

  font-size: 22px;
  font-weight: 600;
}

h3 {
  display: block;
  margin: 0;

  font-size: 30px;
}

h4 {
  margin: 0;
  font-size: 14px;
}

fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

button {
  font-family: 'Metropolis', Helvetica, Arial, sans-serif;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
}

var {
  font-style: normal;
}


input {
  color: ${({ theme }) => theme.placeholders};
  font-size: 14px;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

input[type='number'] {
  -moz-appearance: textfield;
}

::placeholder {
  color:  ${({ theme }) => theme.placeholders};
  font-size: 14px;
}

*:focus {
  outline: none;
}

.info-link {
  position: absolute;
  right: 0;
  top: 0;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    svg {
      opacity: 0.8;
    }
  }

  svg {
    width: 16px;
    height: 16px;
    fill: ${({ theme }) => theme.linksAndButtons};
  }
}

a {
  color: ${({ theme }) => theme.linksAndButtons};
  text-decoration: none;
  opacity: 1;
  transition: opacity 0.15s ease-in-out-out;
  will-change: opacity;

  &.isCyan {
    color: ${({ theme }) => theme.linksAndButtons};
  }

  &.underline {
    text-decoration: underline;
  }
}


a:hover:not(.full-opacity) {
  opacity: 0.8;
}

p {
    font-family: "Metropolis", sans-serif;
    display: block;
    margin-block-start: 10px;
    margin-block-end: 10px;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
}

.scroll-block::-webkit-scrollbar-track
  {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 10px;
    // TODO: is displayed when there is no scroll, you need to fix or remove
    /* background-color: ${({ theme }) => theme.scrollBlockColor}4d; */
  }
.scroll-block::-webkit-scrollbar
  {
    width: 5px;
    height: 5px;
    background-color: transparent;
  }
.scroll-block::-webkit-scrollbar-thumb
  {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: ${({ theme }) => theme.scrollBlockColor};
  }


  /* spaces */

  ${[10, 20, 30].map(
    (n) => css`
      .mb-${n} {
        margin-bottom: ${n}px;
      }

      .mt-${n} {
        margin-top: ${n}px;
      }
    `,
  )}
`

/*
import '../app/grid.module.css';
import * as React from 'react';

import { Link as RouterLink, NavLink, LinkProps, NavLinkProps } from 'react-router-dom';
import type { MouseEventHandler } from 'react';
import classNames from 'classnames';
import env from '../../server/env';
import { defaultLanguage } from '../app/languages';

import type { Language } from '../../@types/types';

import styles from './link.module.css';
import { toasterContext } from '../../core/toaster/toaster.provider';
import { useLanguage } from '../route/route-params.provider';


export type GlobalLinkProps = {
  to: string;
  className?: string;
  children?: React.ReactNode;
  nav?: boolean;
  success?: boolean;
  orange?: boolean;
  primary?: boolean;
  dashed?: boolean;
  solid?: boolean;
  btn?: boolean;
  onClick?: MouseEventHandler;
  disabled?: boolean;
  language?: Language;
  style?: Record<string, unknown>;
  rel?: string;
  'data-hover'?: string;
  title?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  mappedlanguage?: Language;
  itemProp?: string;
  solidBlack?: boolean;
};

const Link = React.memo(function LinkBlock(props: GlobalLinkProps) {
  const { setError, error } = React.useContext(toasterContext);


  const onClickHandler = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault();
    }
    // MEG-7071 Нужно для сброса ошибки в контексте, при переходе со страницы 404.
    if (error) {
      setError(null);
    }
    sessionStorage.setItem(
      `${window.location.pathname}${window.location.search}`,
      window.pageYOffset.toString(),
    );
    onClick?.(event);
  };

  const mappedlanguage = useLanguage();

  if (to.startsWith('http') || to.startsWith('//')) {
    const href = to.startsWith('//') ? to.replace('//', `${env.appUrl}/${mappedlanguage}/`) : to;

    // Waiting for https://github.com/gajus/babel-plugin-react-css-modules/issues/44
    if (className) {
      return (
        <a
          className={classNames(dynamicClassName, className)}
          href={href}
          onClick={onClickHandler}
          {...attrs}
        >
          {children}
        </a>
      );
    }
    return (
      <a href={href} onClick={onClickHandler} className={dynamicClassName} {...attrs}>
        {children}
      </a>
    );
  }

  const LinkComponent: React.JSXElementConstructor<LinkProps | NavLinkProps> = nav
    ? NavLink
    : RouterLink;

  // https://memcrab.atlassian.net/browse/MEG-3773
  const linkTo = mappedlanguage === defaultLanguage && to === '/' ? '' : `/${mappedlanguage}${to}`;
  //console.log({ linkTo, to });
  if (className) {
    return (
      <LinkComponent
        to={linkTo}
        onClick={onClickHandler}
        className={classNames(dynamicClassName, className)}
        {...attrs}
      >
        {children}
      </LinkComponent>
    );
  }

  return (
    <LinkComponent to={linkTo} onClick={onClickHandler} className={dynamicClassName} {...attrs}>
      {children}
    </LinkComponent>
  );
});


import { Link, LinkProps, generatePath, useParams, useSearchParams } from 'react-router-dom';


interface Props extends LinkProps {
  to: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

function LangLink(props: Props) {
  const { lang } = useParams();
  const [searchParams] = useSearchParams();
  const nocache = searchParams.has('nocache');
  const linkParams = {
    lang: props.params?.lang || lang || defaultLanguage,
    ...props.params,
  };
  const queryParams = {
    ...props.query,
    ...(nocache ? { nocache } : undefined),
  };
  const generatedLink = generatePath(props.to, linkParams);
  const queryPart = qs.stringify(queryParams, { addQueryPrefix: true });
  const updatedTo = `${generatedLink}${queryPart}`;

  return (
    <Link to={updatedTo} className={props.className} onClick={props.onClick}>
      {props.children}
    </Link>
  );
}
*/

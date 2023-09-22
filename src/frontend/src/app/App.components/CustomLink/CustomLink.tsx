import { useMemo } from 'react'
import { LinkProps } from 'react-router-dom'
import classNames from 'classnames'
import qs from 'qs'

// view
import { LinkStyled } from './CustomLink.style'

// consts
import { LinkKind, LinkWrapper } from './CustomLink.const'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { FatalError } from 'errors/error'
import { ERROR_TYPE_ROUTER } from 'errors/error.const'

type LinkStyling = {
  isCyan?: boolean
  underline?: boolean
  useHover?: boolean
  navigationLink?: boolean
  navigationActiveLink?: boolean
}

type Props = LinkProps & {
  children: React.ReactNode
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  external?: boolean
  queryParams?: Record<string, string>
  kind?: LinkKind
  styling?: LinkStyling
}

/**
 * Use this component for links
 * Do not use Link component from react-router directly
 *
 * @param LinkProps - mix of react-router link props and custom props, that link should support @Props
 * @returns Custom Link Component
 * in future if DAPP will support add language param to link
 *
 * NOTES:
 *    - consider adding saving scroll for page, inside linkClickHandlerпоки, and restore it in app.controller, of whenever
 *    - if DAPP will support languages, add lang parametr support
 *    - for internal links, or links that can have active state, consider using NavLink, no need for now
 */
export const CustomLink = ({
  children,
  to,
  onClick,
  queryParams,
  styling = {},
  disabled = false,
  kind = LinkWrapper,
  ...optionalLinkProps
}: Props) => {
  const { setError, error } = useToasterContext()
  const isExternalLink = to.toString().startsWith('http')

  const linkClickHandler = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // reset error in toaster context if we navigate from 404 page, only if we have router fatal, and it's not external link
    if (error instanceof FatalError && error.type === ERROR_TYPE_ROUTER && !isExternalLink) setError(null)

    onClick?.(event)
  }

  // handling external link for react-router link
  const finalToAttr = useMemo(() => {
    const queryPart = qs.stringify(queryParams, { addQueryPrefix: true })

    return isExternalLink
      ? {
          to: { pathname: to.toString(), search: queryPart },
          target: '_blank',
          rel: 'noreferrer',
        }
      : { to: `${to}${queryPart}` }
  }, [isExternalLink, queryParams, to])

  const linkClassName = classNames(kind, { ...styling, disabled, useHover: styling.useHover ?? true })

  return (
    <LinkStyled className={linkClassName} {...finalToAttr} {...optionalLinkProps} onClick={linkClickHandler}>
      {children}
    </LinkStyled>
  )
}

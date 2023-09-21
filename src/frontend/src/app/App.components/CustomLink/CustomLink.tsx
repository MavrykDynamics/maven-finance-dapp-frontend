import { useMemo } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import classNames from 'classnames'

import { LinkStyled } from './CustomLink.style'
import { LinkKind, LinkWrapper } from './CustomLink.const'
import qs from 'qs'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

type LinkStyling = {
  isCyan?: boolean
  underline?: boolean
  hover?: boolean
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
 * Use this component to create links.
 * Do not use Link component directly
 * @param param0
 * @returns Custom Link Component
 * in future if DAPP will support add language param to link
 *
 * TODO: consider using NavLink for internal links
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
    if (disabled) event.preventDefault()

    // reset error in toaster context if we navigate from 404 page
    if (error) setError(null)

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
  }, [isExternalLink, to])

  const linkClassName = classNames(kind, { ...styling /*disabled*/ })

  return (
    <LinkStyled className={linkClassName}>
      <Link {...finalToAttr} {...optionalLinkProps} onClick={linkClickHandler}>
        {children}
      </Link>
    </LinkStyled>
  )
}

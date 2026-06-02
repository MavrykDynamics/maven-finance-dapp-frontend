import { useMemo } from 'react'
import { LinkProps, generatePath } from 'react-router'
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
  params?: Record<string, string>
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
const CustomLink = ({
  children,
  to,
  onClick,
  params,
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
    if (isExternalLink)
      return {
        to: to.toString(),
        target: '_blank',
        rel: 'noreferrer',
      }

    return { to: `${generatePath(to.toString(), { ...params })}${qs.stringify(queryParams, { addQueryPrefix: true })}` }
  }, [isExternalLink, params, queryParams, to])

  const linkClassName = classNames(kind, { ...styling, disabled, useHover: styling.useHover ?? true })

  return (
    <LinkStyled
      className={linkClassName}
      {...finalToAttr}
      {...optionalLinkProps}
      onClick={linkClickHandler}
      onContextMenu={disabled ? (e) => e.preventDefault() : undefined}
      onDoubleClick={disabled ? (e) => e.preventDefault() : undefined}
    >
      {children}
    </LinkStyled>
  )
}

export default CustomLink

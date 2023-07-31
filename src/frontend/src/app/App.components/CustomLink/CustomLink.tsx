import { useMemo } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import classNames from 'classnames'

import { LinkStyled } from './CustomLink.style'
import { LinkKind, LinkWrapper } from './CustomLink.const'

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
  external?: boolean
  kind?: LinkKind
  styling?: LinkStyling
}

export const CustomLink = ({
  children,
  to,
  styling = {},
  disabled = false,
  kind = LinkWrapper,
  ...optionalLinkProps
}: Props) => {
  const isExternalLink = to.toString().startsWith('http')

  const requiredLinkProps = useMemo(
    () => ({
      to,
      ...(isExternalLink
        ? {
            to: { pathname: to.toString() },
            target: '_blank',
            rel: 'noreferrer',
          }
        : {}),
    }),
    [isExternalLink, to],
  )

  const linkClassNames = classNames(kind, { ...styling, disabled })

  return (
    <LinkStyled className={linkClassNames}>
      <Link {...requiredLinkProps} {...optionalLinkProps}>
        {children}
      </Link>
    </LinkStyled>
  )
}

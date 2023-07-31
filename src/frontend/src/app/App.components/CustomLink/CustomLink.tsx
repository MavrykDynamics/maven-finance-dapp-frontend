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

type Props = Omit<LinkProps, 'to'> & {
  children: React.ReactNode
  href: string
  disabled?: boolean
  external?: boolean
  kind?: LinkKind
  styling?: LinkStyling
}

export const CustomLink = ({
  children,
  href,
  styling = {},
  disabled = false,
  external = false,
  kind = LinkWrapper,
  ...optionalLinkProps
}: Props) => {
  const requiredLinkProps = useMemo(() => {
    if (disabled)
      return {
        to: '#',
      }

    return {
      to: href,
      ...(external
        ? {
            to: { pathname: href },
            target: '_blank',
            rel: 'noreferrer',
          }
        : {}),
    }
  }, [disabled, external, href])

  const linkClassNames = classNames(kind, { ...styling, disabled })

  return (
    <LinkStyled className={linkClassNames}>
      <Link {...requiredLinkProps} {...optionalLinkProps}>
        {children}
      </Link>
    </LinkStyled>
  )
}

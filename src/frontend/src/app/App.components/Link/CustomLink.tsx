import { useMemo } from 'react'
import { LinkStyled } from './CustomLink.style'
import { Link } from 'react-router-dom'
import { LinkAppearance, LinkKind, LinkRegular, LinkWrapper } from './CustomLink.const'
import classNames from 'classnames'

type Props = {
  children: React.ReactNode
  href: string
  disabled?: boolean
  external?: boolean
  underline?: boolean
  hover?: boolean
  kind?: LinkKind
  appearance?: LinkAppearance
}

// TODO: add all other props that used via classnames with link, update usage of a and Link with CustomLink
export const CustomLink = ({
  children,
  href,
  disabled = false,
  external = false,
  underline = false,
  hover = false,
  kind = LinkWrapper,
  appearance = LinkRegular,
}: Props) => {
  const linkProps = useMemo(() => {
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

  const linkClassNames = classNames(kind, appearance, {
    underline,
    hover,
  })

  return (
    <LinkStyled className={linkClassNames}>
      <Link {...linkProps}>{children}</Link>
    </LinkStyled>
  )
}

import { useEffect, useState } from 'react'
import { Maybe } from 'graphql/jsutils/Maybe'
import Icon from './Icon.view'
import classnames from 'classnames'
import styled from 'styled-components'

const ImgWrapperRoundedStyled = styled.div`
  border-radius: 50%;
  overflow: hidden;
  aspect-ratio: 1;
`

export const ImageWithPlug = ({
  imageLink = null,
  alt,
  className = '',
  plugSrc,
  noImageIconId = 'noImage',
  useRounded = false,
}: {
  imageLink?: Maybe<string>
  alt: string
  className?: string
  plugSrc?: string
  noImageIconId?: string
  useRounded?: boolean
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(imageLink)

  useEffect(() => {
    setImageSrc(imageLink ?? plugSrc ?? null)
  }, [imageLink, plugSrc])

  if (imageSrc) {
    if (useRounded) {
      return (
        <ImgWrapperRoundedStyled className={`img-wrapper ${className}`}>
          <img src={imageSrc} alt={alt} loading="lazy" onError={() => setImageSrc(plugSrc ?? null)} />
        </ImgWrapperRoundedStyled>
      )
    }

    return (
      <div className={`img-wrapper ${className}`}>
        <img src={imageSrc} alt={alt} loading="lazy" onError={() => setImageSrc(plugSrc ?? null)} />
      </div>
    )
  }

  return <Icon id={noImageIconId} className={classnames(className, 'img-plug')} />
}

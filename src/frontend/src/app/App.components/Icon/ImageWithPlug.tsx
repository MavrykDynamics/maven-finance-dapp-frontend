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
  const [status, setStatus] = useState<'pending' | 'loaded' | 'error'>('pending')
  const [currentSrc, setCurrentSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!imageLink) {
      setStatus('error')
      return
    }

    setStatus('pending')

    const img = new Image()
    img.src = imageLink

    img.onload = () => {
      setStatus('loaded')
      setCurrentSrc(imageLink)
    }

    img.onerror = () => {
      setStatus('error')
      setCurrentSrc(null)
    }
  }, [imageLink])

  const Wrapper = useRounded ? ImgWrapperRoundedStyled : 'div'
  const wrapperClass = classnames('img-wrapper', className)

  if (status === 'pending' && plugSrc) {
    return (
      <Wrapper className={wrapperClass}>
        <img src={plugSrc} alt={`${alt} (placeholder)`} loading="lazy" />
      </Wrapper>
    )
  }

  if (status === 'loaded' && currentSrc) {
    return (
      <Wrapper className={wrapperClass}>
        <img src={currentSrc} alt={alt} loading="lazy" />
      </Wrapper>
    )
  }

  // fallback icon (no image available)
  return <Icon id={noImageIconId} className={classnames(className, 'img-plug')} />
}

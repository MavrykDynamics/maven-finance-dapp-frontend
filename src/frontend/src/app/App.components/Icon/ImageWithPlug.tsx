import { useLayoutEffect, useState } from 'react'
import { Maybe } from 'graphql/jsutils/Maybe'
import Icon from './Icon.view'

export const ImageWithPlug = ({
  imageLink,
  alt,
  className = '',
  plugSrc,
}: {
  imageLink?: Maybe<string>
  alt: string
  className?: string
  plugSrc?: string
}) => {
  const [imageExists, setImageExists] = useState(true)

  useLayoutEffect(() => {
    setImageExists(true)
  }, [imageLink])

  if (imageLink && imageExists) {
    return (
      <div className={`img-wrapper ${className}`}>
        <img src={imageLink} alt={alt} loading="lazy" onError={() => setImageExists(false)} />
      </div>
    )
  }

  if (plugSrc) {
    return (
      <div className={`img-wrapper ${className}`}>
        <img src={plugSrc} alt={alt} loading="lazy" />
      </div>
    )
  }

  return <Icon id="noImage" />
}

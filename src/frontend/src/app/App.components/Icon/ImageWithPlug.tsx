import { useEffect, useState } from 'react'
import { Maybe } from 'graphql/jsutils/Maybe'
import Icon from './Icon.view'

export const ImageWithPlug = ({
  imageLink = null,
  alt,
  className = '',
  plugSrc,
}: {
  imageLink?: Maybe<string>
  alt: string
  className?: string
  plugSrc?: string
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(imageLink)

  useEffect(() => {
    setImageSrc(imageLink ?? plugSrc ?? null)
  }, [imageLink, plugSrc])

  if (imageSrc) {
    return (
      <div className={`img-wrapper ${className}`}>
        <img src={imageSrc} alt={alt} loading="lazy" onError={() => setImageSrc(plugSrc ?? null)} />
      </div>
    )
  }

  return <Icon id="noImage" className={className} />
}

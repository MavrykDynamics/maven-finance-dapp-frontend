import React, { useEffect, useState } from 'react'
import Icon from './Icon.view'

export const ImageWithPlug = React.memo(({ imageLink, alt }: { imageLink?: string; alt: string }) => {
  const [imageExists, setImageExists] = useState(true)

  useEffect(() => {
    setImageExists(true)
  }, [])

  if (imageLink && imageExists) {
    return (
      <div className="img-wrapper">
        <img src={imageLink} alt={alt} loading="lazy" onError={() => setImageExists(false)} />
      </div>
    )
  }

  return <Icon id="noImage" />
})

import * as React from 'react'

type Props = {
  id: string
  className?: string
  fill?: string
}

export default function Icon({ id, className = '', fill }: Props) {
  return (
    <svg className={className} style={fill ? { fill } : {}}>
      <use xlinkHref={`/icons/sprites.svg#${id}`} />
    </svg>
  )
}

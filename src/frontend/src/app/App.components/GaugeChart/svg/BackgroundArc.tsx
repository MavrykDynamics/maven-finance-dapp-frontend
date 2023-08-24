import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import colors from 'styles/colors'

type BackgroundArcSvgProps = {
  className?: string
  paint: string
  offset: number
}

export const GRADIENT_NAME = 'greenToRedGradient'

const BackgroundArc = (props: BackgroundArcSvgProps) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  const { className = '', paint = colors[themeSelected].linksAndButtons, offset } = props

  return (
    <svg width={125} height={66} viewBox="0 0 125 66" fill="none" className={className}>
      <path
        d="M121 62C121 29.9675 94.8087 4 62.5 4C30.1913 4 4 29.9675 4 62"
        stroke={paint}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={183}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 500ms ease-in-out' }}
      />

      <defs>
        <linearGradient
          id={GRADIENT_NAME}
          x1={111.225}
          y1={3.9239}
          x2={1.25066}
          y2={3.9239}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#03D463" />
          <stop offset={0.354167} stopColor="#FBFF43" />
          <stop offset={0.671875} stopColor="#FF9D43" />
          <stop offset={1} stopColor="#FF4E43" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default BackgroundArc

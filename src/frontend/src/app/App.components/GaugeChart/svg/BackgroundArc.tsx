import { cyanColor } from 'styles'
import { DASH_ARRAY } from '../GaugeChart'

type BackgroundArcSvgProps = {
  className?: string
  paint: string
  offset: number
}

export const GRADIENT_NAME = 'greenToRedGradient'

const BackgroundArc = ({ className = '', paint = cyanColor, offset }: BackgroundArcSvgProps) => (
  <svg width={125} height={66} viewBox="0 0 125 66" fill="none" className={className}>
    <path
      d="M121 62C121 29.9675 94.8087 4 62.5 4C30.1913 4 4 29.9675 4 62"
      stroke={paint}
      strokeWidth={8}
      strokeLinecap="round"
      strokeDasharray={180}
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
        <stop stopColor="#FF4E43" />
        <stop offset={0.354167} stopColor="#FF9D43" />
        <stop offset={0.671875} stopColor="#FBFF43" />
        <stop offset={1} stopColor="#03D463" />
      </linearGradient>
    </defs>
  </svg>
)

export default BackgroundArc

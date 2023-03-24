import { cyanColor } from 'styles'

type ProgressSvgProps = {
  className?: string
  color?: string
  offset: number
}

const Progress = ({ className = '', color = cyanColor, offset }: ProgressSvgProps) => (
  <svg width={125} height={66} viewBox="0 0 125 66" fill="none" className={className}>
    <path
      d="M121 62C121 29.9675 94.8087 4 62.5 4C30.1913 4 4 29.9675 4 62"
      className="progress"
      stroke={color}
      strokeWidth={8}
      strokeLinecap="round"
      strokeDasharray={180}
      strokeDashoffset={offset}
      style={{ transition: '2s stroke-dashoffset' }}
    />
  </svg>
)

export default Progress

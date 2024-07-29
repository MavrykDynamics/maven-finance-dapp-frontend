import { ACCURATE_DECIMALS_TO_SHOW, DECIMALS_TO_SHOW } from '../../../utils/constants'

/**
 * rounds a decimal part to symbolsCount lenght passed under number argument.
 * @param {string} number - decimal part to be rounded.
 * @param {number} symbolsCount - amount of numbers to left after rounding.
 */
const roundDecimalPart = (number: string, symbolsCount: number): string => {
  let formatterNumber = parseFloat(`0.${number}`)
  return formatterNumber.toFixed(symbolsCount).split('.')[1]
}

export const formatNumber = ({ number, decimalsToShow = 0 }: { number: number; decimalsToShow?: number }) => {
  return number.toLocaleString('en-US', {
    maximumFractionDigits: decimalsToShow,
  })
}

export const CommaNumber = ({
  value,
  endingText,
  beginningText,
  className = '',
  showDecimal = true,
  decimalsToShow = DECIMALS_TO_SHOW,
  useAccurateParsing = false,
}: {
  value: number
  decimalsToShow?: number
  endingText?: string
  beginningText?: string
  className?: string
  showDecimal?: boolean
  useAccurateParsing?: boolean
}) => {
  let numberWithCommas = formatNumber({ decimalsToShow: showDecimal ? decimalsToShow : 0, number: value ?? 0 })
  let titleForNumber = undefined

  // it's exponential number if e-7 it will scientific notation, every that are < -7 normal notation
  if (value?.toString().includes('e') && useAccurateParsing) {
    const [number, tenGrade] = value.toString().split('e')
    const [integer = '', decimals = ''] = number.split('.')
    // extra low number
    if (+tenGrade < 0) {
      // how much zeroes we will have
      const newTenGrade = Number(tenGrade) + integer.length

      // generate title that represent full leght of the extra small number
      titleForNumber = `0.${''.padEnd(Math.abs(+newTenGrade), '0')}${integer}${decimals}`

      // if after multipling decimals we will
      if (Math.abs(+newTenGrade) + integer.length + decimals.length > ACCURATE_DECIMALS_TO_SHOW) {
        // if we have legnth of future decimal part > 5, it means that numberWithCommas will be > 9 symbols and we need to round decimal part
        if (integer.length + decimals.length > 5) {
          numberWithCommas = `0.0...0${roundDecimalPart(integer + decimals, 5)}`
        } else {
          numberWithCommas = `0.0...0${integer}${decimals}`
        }
      } else {
        numberWithCommas = `0.${''.padEnd(Math.abs(+newTenGrade), '0')}${integer}${decimals}`
      }
    }
  }

  if (useAccurateParsing && numberWithCommas && numberWithCommas.length > 12) {
    const splittedDigits = numberWithCommas.split('.')
    titleForNumber = numberWithCommas
    numberWithCommas = `${splittedDigits.at(0)},${splittedDigits.at(1)}...${splittedDigits.at(0)?.at(-1) ?? 0}`
  }

  return (
    <div className={className}>
      <p title={titleForNumber ?? String(value)}>
        {beginningText ? <span className="prefix">{beginningText + ' '}</span> : ''}
        {numberWithCommas}
        {endingText ? <span className="suffix">{' ' + endingText}</span> : ''}
      </p>
    </div>
  )
}

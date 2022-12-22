import { ACCURATE_DECIMALS_TO_SHOW, DECIMALS_TO_SHOW } from '../../../utils/constants'
import { CommaNumberSvgKind, SECONDARY_COMMA_NUMBER } from './CommaNumber.constants'
import { LoadingIcon } from './CommaNumber.style'

/**
 * rounds a decimal part to symbolsCount lenght passed under number argument.
 * @param {string} number - decimal part to be rounded.
 * @param {number} symbolsCount - amount of numbers to left after rounding.
 */
const roundDecimalPart = (number: string, symbolsCount: number): string => {
  let formatterNumber = parseFloat(`0.${number}`)
  return formatterNumber.toFixed(symbolsCount).split('.')[1]
}

const getNumberLetter = (value: number) => {
  const divByThouth = Number(value) / 1_000
  const divByMil = Number(value) / 1_000_000
  const divByBil = Number(value) / 1_000_000_000
  return divByThouth < 1_000 && divByThouth > 1
    ? { letterToShow: 'k', divideAmount: 1_000 }
    : divByMil < 1_000 && divByMil > 1
    ? { letterToShow: 'm', divideAmount: 1_000_000 }
    : divByBil < 1_000 && divByBil > 1
    ? { letterToShow: 'b', divideAmount: 1_000_000_000 }
    : null
}

export const formatNumber = ({
  showDecimal,
  decimalsToShow,
  number,
  letterForNumber,
  showLetter,
}: {
  showDecimal: boolean
  showLetter: boolean
  decimalsToShow: number
  number?: number
  letterForNumber: {
    letterToShow: string
    divideAmount: number
  } | null
}): string | undefined => {
  if (showDecimal && !number) return '0.00'
  return `${Number(Number(number) / (letterForNumber?.divideAmount ?? 1))?.toLocaleString('en-US', {
    maximumFractionDigits: showDecimal ? decimalsToShow : 0,
  })}${letterForNumber?.letterToShow ?? ''}`
}
export const CommaNumber = ({
  value,
  loading,
  endingText,
  beginningText,
  className = '',
  showDecimal = true,
  showLetter = false,
  decimalsToShow = DECIMALS_TO_SHOW,
  svgKind = SECONDARY_COMMA_NUMBER,
  useAccurateParsing = false,
}: {
  value: number
  decimalsToShow?: number
  loading?: boolean
  endingText?: string
  beginningText?: string
  className?: string
  showDecimal?: boolean
  showLetter?: boolean
  useAccurateParsing?: boolean
  svgKind?: CommaNumberSvgKind
}) => {
  const letterToShow = showLetter ? getNumberLetter(value) : null
  let numberWithCommas = formatNumber({
    showDecimal,
    showLetter,
    decimalsToShow,
    number: value,
    letterForNumber: letterToShow,
  })
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
    const splittedDigits = numberWithCommas.split(',')
    titleForNumber = numberWithCommas
    numberWithCommas = `${splittedDigits.at(0)},${splittedDigits.at(1)}...${splittedDigits.at(-1)}`
  }

  return (
    <>
      {loading ? (
        <div className={className}>
          <LoadingIcon className={svgKind}>
            <use xlinkHref="/icons/sprites.svg#loading" />
          </LoadingIcon>
        </div>
      ) : (
        <>
          {beginningText || endingText ? (
            <div className={className} title={titleForNumber}>
              <p>
                {beginningText ? <span className="prefix">{beginningText + ' '}</span> : ''}
                {numberWithCommas}
                {endingText ? <span className="suffix">{' ' + endingText}</span> : ''}
              </p>
            </div>
          ) : (
            <div className={className} title={titleForNumber}>
              {numberWithCommas}
            </div>
          )}
        </>
      )}
    </>
  )
}

/**
 * @deprecated
 */
export const getStringWithoutUnderline = (str: string): string => (str?.length ? str.replaceAll('_', ' ') : '')

/**
 * @deprecated
 */
export const getSeparateCamelCase = (stringCamelCase: string): string =>
  stringCamelCase?.length ? stringCamelCase.replace(/([a-z0-9])([A-Z])/g, '$1 $2') : ''

/**
 * @deprecated
 */
export const getSeparateSnakeCase = (stringSnakeCase: string): string =>
  stringSnakeCase?.length ? stringSnakeCase.replaceAll('_', ' ').toLowerCase() : ''

export const LOWER_CASE = 'LOWER_CASE'
export const CAPITALIZE_CASE = 'CAPITALIZE_CASE'
export const UPPER_CASE = 'UPPER_CASE'
type ParsedStringCaseType = typeof LOWER_CASE | typeof CAPITALIZE_CASE | typeof UPPER_CASE | null

const SNAKE_CASE_REG_EX = new RegExp(/(\w*)\s(\w*)/gm)
const CAMEL_CASE_REG_EX = new RegExp(/([a-z0-9])([A-Z])/g)

const formatStringCase = (stringToFormat: string, preferredCase: ParsedStringCaseType) => {
  switch (preferredCase) {
    case CAPITALIZE_CASE:
      return stringToFormat
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    case LOWER_CASE:
      return stringToFormat.toLowerCase()
    case UPPER_CASE:
      return stringToFormat.toUpperCase()
    default:
      return stringToFormat
  }
}

/**
 * @param stringToParse string we want to parse
 * @param preferredCase case format for parsed string (lover, upper, capitalize, do not format @ParsedStringCaseType)
 * @returns parsed camel case string with preferred case format
 */
export const parseCamelCaseString = (stringToParse: string, preferredCase: ParsedStringCaseType) => {
  if (!stringToParse.length) return ''

  const parsedString = stringToParse.replace(CAMEL_CASE_REG_EX, '$1 $2')

  return formatStringCase(parsedString, preferredCase)
}

/**
 *
 * @param stringToParse string we want to parse
 * @param preferredCase case format for parsed string (lover, upper, capitalize, do not format @ParsedStringCaseType)
 * @returns parsed snake case string with preferred case format
 */
export const parseSnakeCaseString = (stringToParse: string, preferredCase: ParsedStringCaseType) => {
  if (!stringToParse.length) return ''

  const parsedString = stringToParse.replace(SNAKE_CASE_REG_EX, '$1 $2')

  return formatStringCase(parsedString, preferredCase)
}

/**
 *
 * @param str string with bottom underlines. F.e. "string_with_bottom_underline"
 * @returns string with empty spaces instead of bottom underlines. F.e. "string with bottom underline"
 */
export const getStringWithoutUnderline = (str: string): string => (str?.length ? str.replaceAll('_', ' ') : '')

export const getSeparateCamelCase = (stringCamelCase: string): string =>
  stringCamelCase?.length ? stringCamelCase.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase() : ''

export const getSeparateSnakeCase = (stringSnakeCase: string): string =>
  stringSnakeCase?.length ? stringSnakeCase.replaceAll('_', ' ').toLowerCase() : ''

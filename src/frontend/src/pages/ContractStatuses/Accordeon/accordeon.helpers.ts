import { toCamelCase } from 'utils/toCamelCase'

export const getEntrypointText = (str: string) => {
  return `%${toCamelCase(str).replace(/paused/i, '')}`
}

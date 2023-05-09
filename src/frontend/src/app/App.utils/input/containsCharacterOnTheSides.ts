/**
 *
 * @param value string representation of input
 * @param ch character to chech for, by default it's white space
 * @returns boolean value if value starts with or ends with provided character
 */
export function containsCharacterOnTheSides(value: string, ch = ' ') {
  return value.endsWith(ch) || value.startsWith(ch)
}

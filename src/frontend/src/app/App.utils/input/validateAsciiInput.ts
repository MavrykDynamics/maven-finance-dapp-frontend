/**
 * @param input string value that represents current input
 * @param includeNewLineCharacter boolean value which allows new line character
 * @returns boolean value, if current input contains ASCII characters between 32 and 126
 */
export function validateAsciiInput(input: string, includeNewLineCharacter = false) {
  const asciiPattern = includeNewLineCharacter ? /^[\x20-\x7e\n]*$/ : /^[\x20-\x7e]*$/
  return asciiPattern.test(input)
}

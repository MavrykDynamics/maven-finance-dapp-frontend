/**
 * @param input string value that represents current input
 * @returns boolean value, if current input contains ASCII characters between 32 and 126
 */
export function validateAsciiInput(input: string) {
  const asciiPattern = /^[\x20-\x7e\n]*$/
  return asciiPattern.test(input)
}

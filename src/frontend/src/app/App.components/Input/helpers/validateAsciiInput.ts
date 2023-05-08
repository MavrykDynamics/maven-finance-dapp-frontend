// string should contain ASCII characters between 32 and 126
export function validateAsciiInput(input: string) {
  const asciiPattern = /^[\x20-\x7e]*$/
  return asciiPattern.test(input)
}

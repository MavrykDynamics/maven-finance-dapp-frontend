export function validateAsciiInput(input: string) {
  const asciiPattern = /^[\x20-\x7e]*$/
  return asciiPattern.test(input)
}

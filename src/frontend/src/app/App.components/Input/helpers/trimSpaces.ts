export function trimSpaces(value: string) {
  let _value = value.slice(0, value.length)
  if (_value.endsWith('  ')) {
    _value = _value.trimEnd().concat(' ')
  }

  if (_value.startsWith(' ')) {
    _value = _value.trimStart()
  }

  return _value
}

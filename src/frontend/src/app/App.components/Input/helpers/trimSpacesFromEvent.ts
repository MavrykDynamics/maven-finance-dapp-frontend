import React from 'react'

export function trimSpacesFromEvent(e: React.ChangeEvent<HTMLInputElement>): React.ChangeEvent<HTMLInputElement> {
  const { value } = e.target

  let _value = value.slice(0, value.length)
  if (_value.endsWith('  ')) {
    _value = _value.trimEnd().concat(' ')
  }

  if (_value.startsWith(' ')) {
    _value = _value.trimStart()
  }

  const event = { ...e, target: { ...e.target, value: _value } }

  return event
}

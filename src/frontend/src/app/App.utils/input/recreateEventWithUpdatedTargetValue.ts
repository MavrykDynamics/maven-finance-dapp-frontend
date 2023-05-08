export function recreateEventWithUpdatedTargetValue<T extends HTMLInputElement | HTMLTextAreaElement>(
  e: React.ChangeEvent<T>,
  value: string,
) {
  const _event = Object.assign({}, e)
  _event.target = Object.assign({}, _event.target, { value, name: _event.target.name })
  return _event
}

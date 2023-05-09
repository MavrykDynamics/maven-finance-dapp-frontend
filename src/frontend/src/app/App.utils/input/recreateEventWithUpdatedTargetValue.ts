/**
 *
 * @param e React syntatic event for HTMLInputElement | HTMLTextAreaElement
 * @param value string that will replace original e.targte.value
 * @returns same recreated event with updated e.target.value
 */
export function recreateEventWithUpdatedTargetValue<T extends HTMLInputElement | HTMLTextAreaElement>(
  e: React.ChangeEvent<T>,
  value: string,
) {
  const _event = Object.assign({}, e)
  _event.target = Object.assign({}, _event.target, { value, name: _event.target.name })
  return _event
}

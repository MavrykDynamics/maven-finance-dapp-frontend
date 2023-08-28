export const getItemFromStorage = <T extends unknown>(item: string): T => {
  const itemFromStorage = localStorage.getItem(item)
  return itemFromStorage ? JSON.parse(itemFromStorage) : null
}

export const setItemInStorage = <T extends unknown>(item: string, value: T): T => {
  localStorage.setItem(item, JSON.stringify(value))

  return getItemFromStorage(item)
}

export const removeItemFromStorage = (item: string) => {
  localStorage.removeItem(item)
}

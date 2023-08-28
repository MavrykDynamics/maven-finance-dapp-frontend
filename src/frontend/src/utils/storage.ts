import { ZodType, z } from 'zod'

/**
 *
 * @param item string that reperesent key in local storage you wanna get
 * @param schema optional parameter to parse value from local storage
 * @returns item from localStorage | null
 */
export const getItemFromStorage = <T extends unknown>(item: string, schema: ZodType<T, any> = z.any()): T | null => {
  try {
    const itemFromStorage = localStorage.getItem(item)
    return itemFromStorage ? schema.parse(JSON.parse(itemFromStorage)) : null
  } catch (e) {
    console.error(e)
    return null
  }
}

export const setItemInStorage = (item: string, value: unknown): boolean => {
  try {
    localStorage.setItem(item, JSON.stringify(value))
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const removeItemFromStorage = (item: string) => {
  localStorage.removeItem(item)
}

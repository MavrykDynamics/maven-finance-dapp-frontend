/**
 *
 * @param arr array of objects <T = unknown>
 * @param field some property of object T
 * @returns new array with conderted field to Number
 */
export function arrConvertStringToNumber<T = unknown>(arr: T[], field: keyof T) {
  return arr.map((item) => ({ ...item, [field]: Number(item[field]) }))
}

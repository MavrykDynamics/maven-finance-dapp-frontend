// export const replaceNullValuesWithDefault = <T extends Record<string, unknown>>(
//   providerValues: T,
// emptyProviderValues: DeepNonNullable<T>,
//   keysToKeepOriginal?: Array<keyof T>,
// ) => {
//   return Object.fromEntries(
//     Object.entries(providerValues).map(([key, value]) => {
//       const emptyValue = emptyProviderValues[key]

//       if (value === null && !keysToKeepOriginal?.includes(key)) return [key, emptyValue]
//       return [key, value]
//     }),
//   ) as DeepNonNullable<T>
// }

function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

export const replaceNullValuesWithDefault = <T extends Record<string, unknown>>(
  currentValues: DeepNullable<T>,
  defaultValues: T,
): T => {
  // TODO: find more reliable method to copy
  const providerStateCopy: DeepNullable<T> = JSON.parse(JSON.stringify(currentValues))

  // if passed objects to merge are not objects return default values
  if (!isObject(providerStateCopy) || !isObject(defaultValues)) {
    return defaultValues
  }

  // iterate over all
  Object.keys(defaultValues).forEach((key) => {
    const targetValue = providerStateCopy[key]
    const sourceValue = defaultValues[key]

    // merging arrays
    if (Array.isArray(targetValue) && Array.isArray(sourceValue) && providerStateCopy && providerStateCopy[key]) {
      // @ts-expect-error
      providerStateCopy[key] = Array.from(new Set([...targetValue, ...sourceValue]))
    }
    // merging more deep objects
    else if (isObject(targetValue) && isObject(sourceValue) && providerStateCopy && providerStateCopy[key]) {
      // @ts-expect-error
      providerStateCopy[key] = replaceNullValuesWithDefault<T>(Object.assign({}, targetValue), sourceValue)
    }
    // replacing values on merge
    else {
      // console.log('1', { targetValue, sourceValue })

      if (providerStateCopy && targetValue === null) {
        // @ts-expect-error
        providerStateCopy[key] = sourceValue
      }

      // console.log('2', { targetValue, sourceValue })
    }
  })

  return providerStateCopy as T
}

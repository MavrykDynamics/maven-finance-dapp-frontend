const isObject = (item: unknown) => item && typeof item === 'object' && !Array.isArray(item)

/**
 *
 * @param currentValues - current nullable values from provider context
 * @param defaultValues - const with default values for T, that will satisfy that type
 * @returns currentValues with replaced null fields with corresponding default values
 *
 * NOTES:
 *    using ts-expect-error cuz ts thinks that providerStateCopy can be null even when we have check for it to be present
 *
 * TODO: think about types to remove @ts-expect-error
 */
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

    if (!providerStateCopy) return

    // merging arrays
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      // @ts-expect-error
      providerStateCopy[key] = Array.from(new Set([...targetValue, ...sourceValue]))
    }
    // merging more deep objects
    else if (isObject(targetValue) && isObject(sourceValue)) {
      // @ts-expect-error
      providerStateCopy[key] = replaceNullValuesWithDefault<typeof targetValue>(
        Object.assign({}, targetValue),
        sourceValue,
      )
    }
    // replacing values on merge if target value is null set default, othervise keep value from provider
    else {
      if (targetValue === null) {
        // @ts-expect-error
        providerStateCopy[key] = sourceValue
      }
    }
  })

  return providerStateCopy as T
}

/*
TEST CONSTS FOR replaceNullValuesWithDefault
Playground: https://codesandbox.io/s/romantic-christian-nvktdv?file=/src/index.ts

const testProviderValue: DeepNullable<testObjType> = {
  field1: "name from empty",
  field2: null,
  lvl2: {
    field1: [1, 2],
    field2: null,
    field3: null,
    field4: null
  }
};

const testDefaultValue: testObjType = {
  field1: "name from default",
  field2: 12,
  lvl2: {
    field1: [3, 4],
    field2: {},
    field3: 124,
    field4: null
  }
};

type testObjType = {
  field1: string;
  field2: number;
  lvl2: {
    field1: Array<unknown>;
    field2: Record<string, unknown>;
    field3: number;
    field4: null | string;
  };
};

const result = replaceNullValuesWithDefault<testObjType>(
  testProviderValue,
  testDefaultValue
); 

// result should be: {
//   field1: "name from empty",
//   field2: 12,
//   lvl2: {
//      field1: [1, 2, 3, 4],
//      field2: {},
//      field3: 124,
//      field4: null
//    }
//  }

*/

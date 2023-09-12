declare type DeepNullable<T> = {
  [P in keyof T]: T[P] | null
}

declare type DeepDeepNullable<T> = T extends object
  ? {
      [P in keyof T]: T[P] extends object ? DeepDeepNullable<T[P]> | null : T[P]
    }
  : T

declare type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

/**
 * TupleType - some tuple (f.e. "1h" | "24h" |"1")
 * TValue - any value you pass (f.e. string | number | object | array etc.)
 */
declare type TupleKeyValueAny<TupleType extends string, TValue> = {
  [key in TupleType]: TValue
}

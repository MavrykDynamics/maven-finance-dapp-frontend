/**
 * TupleType - some tuple (f.e. "1h" | "24h" |"1")
 * TValue - any value you pass (f.e. string | number | object | array etc.)
 */
export type TupleKeyValueAny<TupleType extends string, TValue> = {
  [key in TupleType]: TValue
}

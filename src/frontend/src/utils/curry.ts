/**
 *
 * @param func a function which takes any parameters
 * @returns new Function with applied parameters OR the actual result of the function if you passed all parameters
 * (NOTE: if your function does NOT return any value and just updates state - it's good, it will work fine)
 *
 *
 * Examples:
 * @example function sum(a, b) {return a + b}
 * const curriedSum = curry(sum)
 *
 * @see
 * Imagine at some point of the time you have only the first parameter "a" and you know after some period of time
 * or after some state update you will get the second parameter "b"
 *
 * To not create additional states or external variables just use it like this
 *
 * @example
 * const afterFirstCallFn = curriedSum(7)
 *
 * @see
 * ....some time passed OR some state was updated and you have all data you need
 *
 * @example
 * const finaltResult = afterFirstCallFn(3) // -> will return 10
 *
 * @see
 * You can use this function with "useRef" hook if you need to collect state from multiple pieces
 *
 * Example:
 * @example
 * const collectorRef = useRef(curry(yourUpdatorFunction))
 *
 * useEffect(() => {
 * // some logic
 *
 * collectorRef.current<YourDataType>(pieceOfData)
 *
 * }, [])
 *
 *
 * // ....later in the code
 * return <div onClick={() => collectorRef.current<AnotherType>(anotherPieceOFData)}>update</div>
 *
 *@see
 * As you can see the "curried" function is generic and takes type when calling.
 * It's recommended always give type when calling the "curried" version of your function to have typescript checks
 */
export function curry(func: Function) {
  return function curried<T extends unknown>(this: unknown, ...args: T[]) {
    if (args.length >= func.length) {
      return func.apply(this, args)
    } else {
      return (...args2: T[]) => {
        return curried.apply(this, args.concat(args2))
      }
    }
  }
}

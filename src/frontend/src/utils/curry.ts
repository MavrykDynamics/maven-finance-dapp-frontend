export function curry<T extends unknown>(func: Function) {
  return function curried(this: unknown, ...args: T[]) {
    if (args.length >= func.length) {
      return func.apply(this, args)
    } else {
      return (...args2: T[]) => {
        return curried.apply(this, args.concat(args2))
      }
    }
  }
}

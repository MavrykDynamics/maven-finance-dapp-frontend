declare type DeepNonNullable<T> = {
  [P in keyof T]-?: NonNullable<T[P]>
}

declare type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

declare type PromiseResolvedType<T> = T extends Promise<infer R> ? R : never

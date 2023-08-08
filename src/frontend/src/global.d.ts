declare type DeepNonNullable<T> = {
  [P in keyof T]-?: NonNullable<T[P]>
}

declare type DeepNullable<T> = {
  [P in keyof T]: T[P] | null
}

declare type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

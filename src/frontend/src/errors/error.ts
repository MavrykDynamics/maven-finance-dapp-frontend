import type { InputPayload, Payload } from './error.type'

class ExtendedErrorClass extends Error {
  payload: Payload | InputPayload

  constructor(messageOrError: string | Error, payload: Payload = {}) {
    const message = messageOrError instanceof Error ? messageOrError.message : messageOrError
    const rawStack = messageOrError instanceof Error ? messageOrError.stack : undefined
    super(message)
    this.name = this.constructor.name
    const stack = rawStack?.replace(/^.+\n/, `${this.name}: ${this.message}\n`)
    this.payload = payload
    if (stack) {
      this.stack = stack
    }
  }

  /**
   * Update place where error happens
   *
   * @returns updated error
   */
  setScope(scope: string): this {
    this.payload.scope = scope
    return this
  }

  toString(): string {
    return `${this.name}: ${this.message} ${JSON.stringify(this.payload)}`
  }
}

export class ValidationError extends ExtendedErrorClass {}
export class PermissionError extends ExtendedErrorClass {}
export class ApiError extends ExtendedErrorClass {}
export class FatalError extends ExtendedErrorClass {}
export class PropertyError extends ExtendedErrorClass {
  declare payload: InputPayload
}

export type Errors = Error | PermissionError | ApiError | ValidationError | FatalError | null
export type ExtendedError = FatalError | ApiError | PermissionError | ValidationError

/**
 * Function checks the error type based on payload similarity
 * PropertyError doesn't included intentionally
 * @param e any error type
 * @returns true if this is extendedError
 */
export function isExtendedError(e: unknown): e is ExtendedError {
  return (
    e instanceof FatalError || e instanceof ApiError || e instanceof PermissionError || e instanceof ValidationError
  )
}

/**
 * Convert unknown to Error object or keep if it was error
 * @param rawError unknown
 * @returns Error or Extended Error class
 */
export function unknownToError(rawError: unknown): Error | ExtendedError {
  if (isExtendedError(rawError)) return rawError
  if (rawError instanceof Error) return rawError
  if (typeof rawError === 'string') return new Error(rawError)

  return new Error('unknown Error with no message, stack and payload')
}

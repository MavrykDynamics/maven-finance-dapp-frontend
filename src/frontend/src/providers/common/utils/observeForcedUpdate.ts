import { generateUniqueId } from 'utils/calcFunctions'

type ForcedUpdateListener = () => void

const forcedUpdateState: {
  hasForcedUpdate: boolean
  listeners: Map<string, ForcedUpdateListener>
  registerListener: (listener: ForcedUpdateListener) => string
  removeListener: (listenerId: string) => void
} = {
  hasForcedUpdate: false,
  listeners: new Map(),
  registerListener: function (listener) {
    const listenerId = generateUniqueId()
    this.listeners.set(listenerId, listener)
    return listenerId
  },
  removeListener: function (listenerId) {
    if (this.listeners.has(listenerId)) {
      this.listeners.delete(listenerId)
    } else {
      if (process.env.REACT_APP_ENV === 'dev') console.error(`listener with Id: ${listenerId} does not exist`)
    }
  },
}

export const forcedUpdateProxy = new Proxy(forcedUpdateState, {
  set: function (target, key, value) {
    if (key === 'hasForcedUpdate') {
      if (value === true) {
        target['hasForcedUpdate'] = true
        target['listeners'].forEach((fn) => fn())
      } else {
        target['hasForcedUpdate'] = false
      }
      return true
    }

    throw new Error(`Invalid key "${String(key)}", only "hasForcedUpdate" is allowed`)
  },
})

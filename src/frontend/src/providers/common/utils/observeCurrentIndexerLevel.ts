import { generateUniqueId } from 'utils/calcFunctions'

type indexedLvlListener = (currentLvl: number) => void

const currentIndexerLevel: {
  currentIndexedLevel: number
  listeners: Map<string, indexedLvlListener>
  registerListener: (listener: indexedLvlListener) => string
  removeListener: (listenerId: string) => void
} = {
  currentIndexedLevel: 0,
  listeners: new Map(),
  registerListener: function (listener) {
    const listenerId = generateUniqueId()
    this.listeners.set(listenerId, listener)
    // if (process.env.REACT_APP_ENV === 'dev')
    //   console.log({ refetchListeners: this.listeners, registerListenerListenerId: listenerId })
    return listenerId
  },
  removeListener: function (listenerId) {
    if (this.listeners.has(listenerId)) {
      this.listeners.delete(listenerId)
      // if (process.env.REACT_APP_ENV === 'dev')
      //   console.info(`listener with Id: ${listenerId} removed`, { refetchListeners: this.listeners })
    } else {
      if (process.env.REACT_APP_ENV === 'dev')
        console.error(`listener with Id: ${listenerId} do not present in: ${JSON.stringify(this.listeners)}`)
      // throw new Error(`listener with Id: ${listenerId} do not present in: ${JSON.stringify(this.listeners)}`)
    }
  },
}

export const currentIndexerLevelProxy = new Proxy(currentIndexerLevel, {
  set: function (target, key, value) {
    if (key === 'currentIndexedLevel') {
      target['currentIndexedLevel'] = value
      target['listeners'].forEach((fn) => fn(value))
      return true
    }

    throw new Error(`Wrong key selected, you tried ${key.toString()}, but allowed to change only currentIndexedLevel`)
  },
})

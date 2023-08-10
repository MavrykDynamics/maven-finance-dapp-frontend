type indexedLvlListener = (currentLvl: number) => void

const currentIndexerLevel: {
  currentIndexedLevel: number
  listeners: indexedLvlListener[]
  registerListener: (listener: indexedLvlListener) => void
  removeListener: (listener: indexedLvlListener) => void
} = {
  currentIndexedLevel: 0,
  listeners: [],
  registerListener: function (listener) {
    this.listeners.push(listener)
  },
  removeListener: function (listener) {
    this.listeners.filter((activeListener) => activeListener !== listener)
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

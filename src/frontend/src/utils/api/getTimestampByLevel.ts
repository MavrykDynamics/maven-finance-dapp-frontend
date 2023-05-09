const getTimestampByLevel = async (level: number): Promise<string> => {
  if (level) {
    try {
      const timestamp = await (
        await fetch(`https://api.ghostnet.tzkt.io/v1/blocks/${level}/timestamp`, {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
          },
        })
      ).json()

      return timestamp
    } catch (error) {
      console.error('getTimestampByLevel', error)
    }
  }
  return ''
}

export default getTimestampByLevel

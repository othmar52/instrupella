import utils from '../utils.js'
const { getBpm } = utils()

export default () => {
  const getSecondsPerQuarterNote = (track, overrideTempo=null) => {
    const useTempo = (overrideTempo > 0)
      ? parseFloat(overrideTempo)
      : getBpm(track)

    if (useTempo === 0) {
      return 0
    }

    return 60 / useTempo
  }

  return {
    getSecondsPerQuarterNote
  }
}

import secondsPerQuarterNoteMixin from './secondsPerQuarterNote'
const { getSecondsPerQuarterNote } = secondsPerQuarterNoteMixin()

export default () => {
  const getNegativeDownbeat = (tempo, downbeat) => {
    const secondsFor4Bars = getSecondsPerQuarterNote(null, tempo) * 16
    if(secondsFor4Bars === 0) {
      return 0
    }
    let newDownbeat = downbeat
    while(newDownbeat > 0) {
      newDownbeat -= secondsFor4Bars
    }
    return parseFloat(newDownbeat)
  }

  return {
    getNegativeDownbeat
  }
}

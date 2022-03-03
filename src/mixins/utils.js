export default () => {

  const getBpm = (track) => {
    if (track === null) {
      return 0
    }
    if (track.bpm > 0) {
        return track.bpm
    }
    if (track.bpmdetect > 0) {
        return track.bpmdetect
    }
    return 0
  }

  const isManualBpm = (track) => {
    return track && track.bpm > 0
  }

  return {
    getBpm,
    isManualBpm
  }
}

import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import rangeMixin from './mixins/utils/range'
import getSecondsPerQuarterNoteMixin from './mixins/utils/secondsPerQuarterNote'
import mapValueMixin from './mixins/utils/mapValue'
import getNegativeDownbeatMixin from './mixins/utils/negativeDownbeat'
import utilsMixin from './mixins/utils'

const { getBpm } = utilsMixin()
const { range } = rangeMixin()
const { getSecondsPerQuarterNote } = getSecondsPerQuarterNoteMixin()
const { getNegativeDownbeat } = getNegativeDownbeatMixin()
const { mapValue } = mapValueMixin()

const ctrlKeyToFunc = (ctrlKey) => {
  let match = /^d\.(\d*)\.(.*)$/.exec(ctrlKey)
  if (match && ctrlMap[match[2]]) {
    return [parseInt(match[1]), ctrlMap[match[2]]]
  }
  match = /^g\.(.*)$/.exec(ctrlKey)
  if (match && ctrlMap[match[1]]) {
    return [null, ctrlMap[match[1]]]
  }
  console.warn('ERROR ctrlKeyToFunc', ctrlKey)
}

const midiInputMapping = {
  '2-noteon-0': 'd.0.togglePlayMidi',
  '2-noteon-27': 'd.0.toggleMuteMidi',
  '2-noteoff-27': 'd.0.toggleMuteMidi',
  '16-noteon-66': 'd.0.toggleHotCueDeleteMode',
  '2-controlchange-6': 'd.0.handleJogWheelRotate',
  '2-controlchange-22': 'd.0.setVolumeMidi',
  '6-noteon-1': 'd.0.hotCue1DownMidi',
  '6-noteoff-1': 'd.0.hotCue1UpMidi',
  '6-noteon-2': 'd.0.hotCue2DownMidi',
  '6-noteoff-2': 'd.0.hotCue2UpMidi',
  '6-noteon-3': 'd.0.hotCue3DownMidi',
  '6-noteoff-3': 'd.0.hotCue3UpMidi',
  '6-noteon-4': 'd.0.hotCue4DownMidi',
  '6-noteoff-4': 'd.0.hotCue4UpMidi',
  '1-noteon-2': 'g.midiShift1On',
  '1-noteon-1': 'g.midiShift2On',
  '1-noteon-0': 'g.midiShift3On',
  '1-noteoff-2': 'g.midiShiftOff',
  '1-noteoff-1': 'g.midiShiftOff',
  '1-noteoff-0': 'g.midiShiftOff',
  '2-controlchange-9': 'd.0.setPlaybackRateMidi'
}
const midiOutputMapping = {
  'd.0.muteOn': ['sendNoteOn', [27, [2], {rawAttack: 1}]],
  'd.0.muteOff': ['sendNoteOn', [27, [2], {rawAttack: 0}]],
  'd.0.play': ['sendNoteOn', [0, [2], {rawAttack: 2}]],
  'd.0.pause': ['sendNoteOn', [0, [2], {rawAttack: 1}]],
  'd.0.hotCue1Off': ['sendNoteOn', [1, [6], {rawAttack: 0}]],
  'd.0.hotCue1Dimmed': ['sendNoteOn', [1, [6], {rawAttack: 1}]],
  'd.0.hotCue1On': ['sendNoteOn', [1, [6], {rawAttack: 2}]],
  'd.0.hotCue2Off': ['sendNoteOn', [2, [6], {rawAttack: 0}]],
  'd.0.hotCue2Dimmed': ['sendNoteOn', [2, [6], {rawAttack: 1}]],
  'd.0.hotCue2On': ['sendNoteOn', [2, [6], {rawAttack: 2}]],
  'd.0.hotCue3Off': ['sendNoteOn', [3, [6], {rawAttack: 0}]],
  'd.0.hotCue3Dimmed': ['sendNoteOn', [3, [6], {rawAttack: 1}]],
  'd.0.hotCue3On': ['sendNoteOn', [3, [6], {rawAttack: 2}]],
  'd.0.hotCue4Off': ['sendNoteOn', [4, [6], {rawAttack: 0}]],
  'd.0.hotCue4Dimmed': ['sendNoteOn', [4, [6], {rawAttack: 1}]],
  'd.0.hotCue4On': ['sendNoteOn', [4, [6], {rawAttack: 2}]]
}
const ctrlMap = {
  'toggleMute': 'toggleMute',
  'toggleMuteMidi': 'toggleMuteMidi',
  'togglePlay': 'togglePlay',
  'togglePlayMidi': 'togglePlayMidi',
  'setVolume': 'setVolume',
  'setVolumeMidi': 'setVolumeMidi',
  'nudgeAhead': 'nudgeAhead',
  'nudgeBehind': 'nudgeBehind',
  'seekToSecond': 'seekToSecond',
  'handleJogWheelRotate': 'handleJogWheelRotate',
  'hotCueDown': 'hotCueDown',
  'hotCueUp': 'hotCueUp',
  'hotCue1DownMidi': 'hotCue1DownMidi',
  'hotCue1UpMidi': 'hotCue1UpMidi',
  'hotCue2DownMidi': 'hotCue2DownMidi',
  'hotCue2UpMidi': 'hotCue2UpMidi',
  'hotCue3DownMidi': 'hotCue3DownMidi',
  'hotCue3UpMidi': 'hotCue3UpMidi',
  'hotCue4DownMidi': 'hotCue4DownMidi',
  'hotCue4UpMidi': 'hotCue4UpMidi',
  'midiShift1On': 'midiShift1On',
  'midiShift2On': 'midiShift2On',
  'midiShift3On': 'midiShift3On',
  'midiShiftOff': 'midiShiftOff',
  'setPlaybackRateMidi': 'setPlaybackRateMidi',
  'toggleHotCueDeleteMode': 'toggleHotCueDeleteMode'
}

export const useMainStore = defineStore({
  id: 'main',
  state: () => ({
    midiInputMappings: useStorage('midiInputMappings', midiInputMapping),
    midiLearn: useStorage('midiLearn', false),
    midiLearnItem: useStorage('midiLearnItem', null),
    midiShift: useStorage('midiShift', 0),
    scrollToTop: useStorage('midiLearn', false),
    trackProps: useStorage('trackProps', []),
    decks: useStorage('decks', []),
    tracks: useStorage('tracks', []),
    workingTempo: useStorage('workingTempo', 0),
    workingDownbeat: useStorage('workingDownbeat', 0)
  }),
  getters: {
    getAllmidiInputMappings() {
      return this.midiInputMappings
    },
    midiInputMappingsEmpty() {
      return this.midiInputMappings === {}
    },
    getMidiLearn() {
      return this.midiLearn <= 0
    },
    getAllTrackProps() {
      return this.trackProps
    },
    getDeckAmount() {
      return this.decks.length
    },
    getDecks() {
      return this.decks
    },
    getTracks() {
      return this.tracks
    },
    getScrollToTop() {
      return this.scrollToTop
    },
    getWorkingTempo() {
      return this.workingTempo
    },
    getWorkingDownbeat() {
      return this.workingDownbeat
    }
  },
  actions: {
    fireControlElement(controlId, value=null) {
      const deckCtrlParams = ctrlKeyToFunc(controlId)
      if (deckCtrlParams) {
        if(this.midiLearnItem !== null) {
          this.addMidiMapping(controlId)
          return
        }
        this[deckCtrlParams[1]](deckCtrlParams[0], value)
      }
    },
    setScrollToTop(value) {
      this.scrollToTop = value
    },
    midiShift1On() {
      //console.log('midiShift', 1)
      this.midiShift = 1
    },
    midiShift2On() {
      //console.log('midiShift', 2)
      this.midiShift = 2
    },
    midiShift3On() {
      //console.log('midiShift', 3)
      this.midiShift = 3
    },
    midiShiftOff() {
      //console.log('midiShift', 0)
      this.midiShift = 0
    },
    setWorkingTempo(value) {
      this.workingTempo = parseFloat(value)
    },
    setWorkingDownbeat(value) {
      this.workingDownbeat = parseFloat(value)
    },
    setTracks(tracks) {
      // ensure all track properties exists
      const trackTemplate = {
        path: "",
        artist: "",
        title: "",
        year: 0,
        length: 0.0,
        size: 0,
        bpmdetect: 0.0,
        bpm: 0.0,
        key: "",
        downbeat: null,
        peakfile: "",
        hotcues: [],
        tempoDrift: false,
        downbeatDrift: false,
        like: 0,
        noTempo: false,
        tags: []
      }
      for (const track of tracks) {
        for (const [key, value] of Object.entries(trackTemplate)) {
          if (key in track === true) {
            continue
          }
          track[key] = trackTemplate[key]
        }
      }
      this.tracks = tracks
    },
    addTrackProp(trackProp) {
      // console.log('store.addTrackProp() to', trackProp)
      // update local db
      const indexDb = this.tracks.findIndex(item => item.path === trackProp.path)
      if(indexDb > -1) {
        for (const [key, value] of Object.entries(trackProp)) {
          this.tracks[indexDb][key] = value
        }
      }
      // update storage with edited properties
      const index = this.trackProps.findIndex(item => item.path === trackProp.path)
      if (index === -1) {
        this.trackProps.push(trackProp)
        return
      }
      for (const [key, value] of Object.entries(trackProp)) {
        this.trackProps[index][key] = value
      }
      // console.log('updated object', this.trackProps[index])
      
    },
    /*
    addMidiMapping(midiMapping) {
      this.midiInputMappings.push(midiMapping)
    },
    removeMidiMapping(index) {
      this.midiInputMappings.splice(index, 1)
    },
    */
    resetMidiMappings() {
      this.midiInputMappings = midiInputMapping
    },
    toggleMidiLearn() {
      this.midiLearn = !this.midiLearn
      // console.log('store.toggleMidiLearn() to', this.midiLearn)
    },
    clearDecks() {
      this.decks = []
    },
    createDeck() {
      const deck = {
        index: this.decks.length,
        track: null,
        play: false,
        mute: false,
        volume: 1,
        playbackRate: 1,
        tempoFactor: 1, // normal, double or half tempo
        currentSecond: 0,
        skipLength: 0.05,
        timestretch: false,
        pixelPerSecond: 400,
        jogWheelDebounce: 0,
        hotCues: {
          deleteMode: false,
          playStateOnCueStart: false,
          ignoreNextEndEvent: false,
          haveAnyCues: false,
          cues: []
        },

        // control helpers
        nudgeAhead: 0,
        nudgeBehind: 0,
        seekToSecond: -1,
        seekToSecondAndPlay: -1,
        seekToSecondAndStop: -1,
        hotCuesChange: false
      }
      // TODO: read hot cue amount from config
      for (const idx in range(0, 5)) {
        deck.hotCues.cues.push({
          down: false,
          up: false,
          second: null
        })
      }
      this.decks.push(deck)
    },
    toggleMute(deckIndex, forceNewState=null) {
      // console.log('toggleMute', forceNewState)
      const newMuteState = (forceNewState === null)
        ? !this.decks[deckIndex].mute
        : forceNewState
      this.decks[deckIndex].mute = newMuteState
      this.checkFireMidiEvent(
        newMuteState
          ? `d.${deckIndex}.muteOn`
          : `d.${deckIndex}.muteOff`
      )
    },
    toggleMuteMidi(deckIndex) {
      // drop incoming data byte as argument
      this.toggleMute(deckIndex, null)
    },
    togglePlayMidi(deckIndex) {
      this.togglePlay(deckIndex)
    },
    togglePlay(deckIndex, forceNewState=null) {
      const newPlayState = (forceNewState === null)
        ? !this.decks[deckIndex].play
        : forceNewState
      this.decks[deckIndex].play = newPlayState
      this.checkFireMidiEvent(
        newPlayState
          ? `d.${deckIndex}.play`
          : `d.${deckIndex}.pause`
      )
    },
    loadTrackByPath(deckIndex, path) {
      const trackResult = this.tracks.filter(item => item.path === path)
      if (trackResult.length === 0) {
        return
      }
      this.loadTrack(deckIndex, trackResult[0].id)
    },
    loadTrack(deckIndex, trackIndex) {
      this.setScrollToTop(true)
      this.setWorkingTempo(getBpm(this.tracks[trackIndex]))
      //console.log('storage set downbeat', parseFloat(this.tracks[trackIndex].downbeat), this.tracks[trackIndex])
      this.setWorkingDownbeat(
        (this.tracks[trackIndex].downbeat !== null)
          ? parseFloat(this.tracks[trackIndex].downbeat)
          : 0
      )
      this.decks[deckIndex].track = this.tracks[trackIndex]
      this.decks[deckIndex].tempoFactor = 1
      this.togglePlay(deckIndex, false)
      this.toggleMute(deckIndex, false)
      // TODO: read persisted hot cues from track
      this.decks[deckIndex].hotCues = {
        deleteMode: false,
        playStateOnCueStart: false,
        ignoreNextEndEvent: false,
        haveAnyCues: false,
        cues: []
      }
      for (const idx in range(0, 5)) {
        this.decks[deckIndex].hotCues.cues.push({
          down: false,
          up: false,
          second: null
        })
        this.checkFireMidiEvent(`d.${deckIndex}.hotCue${1+idx*1}Off`)
      }
      this.setHotCuesChange(deckIndex, true)
    },
    nudgeAhead(deckIndex, skipLength=null) {
      this.decks[deckIndex].nudgeAhead = (skipLength === null)
        ? this.decks[deckIndex].skipLength
        : parseFloat(skipLength)
    },
    nudgeBehind(deckIndex, skipLength=null) {
      this.decks[deckIndex].nudgeBehind = (skipLength === null)
        ? this.decks[deckIndex].skipLength
        : parseFloat(skipLength)
    },
    seekToSecond(deckIndex, targetSecond=null) {
      this.decks[deckIndex].seekToSecond = parseFloat(targetSecond)
    },
    seekToSecondAndPlay(deckIndex, targetSecond=null) {
      this.decks[deckIndex].seekToSecondAndPlay = parseFloat(targetSecond)
    },
    seekToSecondAndStop(deckIndex, targetSecond=null) {
      this.decks[deckIndex].seekToSecondAndStop = parseFloat(targetSecond)
    },
    clearNudge(deckIndex) {
      this.decks[deckIndex].nudgeAhead = 0
      this.decks[deckIndex].nudgeBehind = 0
    },
    setVolume(deckIndex, volume) {
      this.decks[deckIndex].volume = volume
    },
    setVolumeMidi(deckIndex, volume) {
      this.setVolume(deckIndex, volume * 1/127)
    },
    loopTempoFactor(deckIndex) {
      if (this.decks[deckIndex].tempoFactor === 1) {
        this.decks[deckIndex].tempoFactor = 2
        return
      }
      if (this.decks[deckIndex].tempoFactor === 2) {
        this.decks[deckIndex].tempoFactor = 0.5
        return
      }
      this.decks[deckIndex].tempoFactor = 1
    },
    setPlaybackRate(deckIndex, playbackRate) {
      this.decks[deckIndex].playbackRate = playbackRate
    },
    setPlaybackRateMidi(deckIndex, midiCCValue) {
      let newPlayBackrate = 1
      switch(true) {
        case midiCCValue > 64:
          newPlayBackrate = mapValue(midiCCValue, 64, 127, 1, 1.1)
          break
        case midiCCValue < 64:
          newPlayBackrate = mapValue(midiCCValue, 0, 64, 0.9, 1)
          break
      }
      return this.setPlaybackRate(deckIndex, newPlayBackrate)
    },
    setCurrentSecond(deckIndex, currentSecond) {
      // console.log('store.setCurrentSec', currentSecond)
      this.decks[deckIndex].currentSecond = parseFloat(currentSecond)
    },
    hotCue1DownMidi(deckIndex) { this.hotCueDown(deckIndex, 0) },
    hotCue1UpMidi(deckIndex) { this.hotCueUp(deckIndex, 0) },
    hotCue2DownMidi(deckIndex) { this.hotCueDown(deckIndex, 1) },
    hotCue2UpMidi(deckIndex) { this.hotCueUp(deckIndex, 1) },
    hotCue3DownMidi(deckIndex) { this.hotCueDown(deckIndex, 2) },
    hotCue3UpMidi(deckIndex) { this.hotCueUp(deckIndex, 2) },
    hotCue4DownMidi(deckIndex) { this.hotCueDown(deckIndex, 3) },
    hotCue4UpMidi(deckIndex) { this.hotCueUp(deckIndex, 3) },
    hotCueDown(deckIndex, hotCueIndex) {
      // console.log('hotCueDown', deckIndex, hotCueIndex, this.decks[deckIndex].hotCues.cues[hotCueIndex].second)
      if (!this.decks[deckIndex].track) {
        return
      }
      if (this.decks[deckIndex].hotCues.deleteMode === true) {
        // console.log('ignoring set cue within delete mode...')
        return
      }
      if (this.decks[deckIndex].hotCues.cues[hotCueIndex].second === null) {
        // set new cue point
        // console.log('set new cue point', this.decks[deckIndex].currentSecond)
        // TODO: how to read currentSecond from player? audioprocess callback maybe has a few milliseconds offset...
        this.decks[deckIndex].hotCues.cues[hotCueIndex].second = this.decks[deckIndex].currentSecond
        this.decks[deckIndex].hotCues.ignoreNextEndEvent = true
        this.decks[deckIndex].hotCuesChange = true
        this.decks[deckIndex].hotCues.haveAnyCues = true
        this.checkFireMidiEvent(`d.${deckIndex}.hotCue${1+hotCueIndex*1}Dimmed`)
        return
      }
      this.decks[deckIndex].hotCues.playStateOnCueStart = this.decks[deckIndex].play
      this.decks[deckIndex].seekToSecondAndPlay = this.decks[deckIndex].hotCues.cues[hotCueIndex].second
      this.checkFireMidiEvent(`d.${deckIndex}.hotCue${1+hotCueIndex*1}On`)
    },
    hotCueUp(deckIndex, hotCueIndex) {
      // console.log('hotCueUp', deckIndex, hotCueIndex)
      if (this.decks[deckIndex].hotCues.ignoreNextEndEvent === true) {
        this.decks[deckIndex].hotCues.ignoreNextEndEvent = false
        // console.log('ignoring end event...')
        return
      }
      if (!this.decks[deckIndex].track) {
        return
      }
      if (this.decks[deckIndex].hotCues.deleteMode === true) {
        if (this.decks[deckIndex].hotCues.cues[hotCueIndex].second === null) {
          return
        }
        this.deleteHotCue(deckIndex, hotCueIndex)
        this.checkFireMidiEvent(`d.${deckIndex}.hotCue${1+hotCueIndex*1}Off`)
        return
      }
      // console.log('pressHotCueEnd', idx, 'props.play', props.play, 'playStateOnCueStart', playStateOnCueStart.value)
      if (this.decks[deckIndex].hotCues.playStateOnCueStart === false) {
        this.decks[deckIndex].seekToSecondAndStop = this.decks[deckIndex].hotCues.cues[hotCueIndex].second
        
      }
      this.checkFireMidiEvent(`d.${deckIndex}.hotCue${1+hotCueIndex*1}Dimmed`)
    },
    deleteHotCue(deckIndex, hotCueIndex) {
      // console.log('deleteHotCue', deckIndex, hotCueIndex)
      this.decks[deckIndex].hotCues.cues[hotCueIndex].second = null
      this.decks[deckIndex].hotCuesChange = true
      // leave deleteMode in case there are no cues left
      if (this.decks[deckIndex].hotCues.cues.filter(item => item.second > 0).length === 0) {
        this.decks[deckIndex].hotCues.deleteMode = false
        this.decks[deckIndex].hotCues.haveAnyCues = false
        return
      }
    },
    toggleHotCueDeleteMode(deckIndex, forceNewState=null) {
      if (forceNewState === null) {
        this.decks[deckIndex].hotCues.deleteMode = !this.decks[deckIndex].hotCues.deleteMode
        return
      }
      this.decks[deckIndex].hotCues.deleteMode = forceNewState
    },
    setHotCuesChange(deckIndex, value) {
      this.decks[deckIndex].hotCuesChange = value 
    },
    handleJogWheelRotate(deckIndex, midiValue) {
      let directionFunc = 'nudgeAhead'
      let duration = 0.001
      let relativeValue = midiValue

      if (midiValue > 64) {
        directionFunc = 'nudgeBehind'
        relativeValue = 128 - midiValue
      }

      if (this.midiShift > 0 && this.decks[deckIndex].track !== null) {
        this.decks[deckIndex].jogWheelDebounce += relativeValue
        // console.log('jogWheelDebounce', relativeValue, this.decks[deckIndex].jogWheelDebounce)
        if(this.decks[deckIndex].jogWheelDebounce < 20) {
          // console.log('jogWheelDebounce ignore')
          return
        }
        this.decks[deckIndex].jogWheelDebounce = 0
        // console.log('jogWheelDebounce handle')
        let secondsPerQuarterNote = getSecondsPerQuarterNote(
          null,
          (this.workingTempo < 30) ? 120.0 : this.workingTempo
        )
        let factor
        switch (this.midiShift) {
          case 2:
            factor = 4
            break
          case 3:
            factor = 16
            break
          default:
            factor = 1
        }
        if (secondsPerQuarterNote > 0) {
          if (directionFunc === 'nudgeAhead') {
            return this.seekToNextDivision(deckIndex, secondsPerQuarterNote*factor)
          }
          return this.seekToPreviousDivision(deckIndex, secondsPerQuarterNote*factor)
        }
      }
      this[directionFunc](deckIndex, parseFloat(duration * relativeValue))
    },
    seekToNextDivision(deckIndex, divisionDuration) {
        let currentTimestamp = this.decks[deckIndex].currentSecond + 0.001
        let trackDuration = this.decks[deckIndex].track.length
        let loopSecond = getNegativeDownbeat(this.workingTempo, this.workingDownbeat)
        while (loopSecond < trackDuration) {
          loopSecond += divisionDuration
          if(loopSecond < currentTimestamp) {
            continue
          }
          this.decks[deckIndex].jogWheelDebounce = 0
          this.seekToSecond(deckIndex, loopSecond)
          return
        }
    },
    seekToPreviousDivision(deckIndex, divisionDuration) {
        const negativeDownbeat = getNegativeDownbeat(this.workingTempo, this.workingDownbeat)
        const currentDivision = Math.floor(
          (this.decks[deckIndex].currentSecond - negativeDownbeat)
          / divisionDuration
        )
        let targetSecond = negativeDownbeat + ((currentDivision-1) * divisionDuration)
        this.seekToSecond(
          deckIndex,
          targetSecond < 0 ? 0 : targetSecond
        )

    },
    handleIncomingMidiEvent(e) {
      switch(e.message.type) {
        case 'noteon':
        case 'noteoff':
        case 'controlchange':
          const eventIdentifier = `${e.message.channel}-${e.message.type}-${e.dataBytes[0]}`
          if (typeof this.midiInputMappings[eventIdentifier] !== 'undefined') {
            // console.log('SUCCESS', eventIdentifier, this.midiInputMappings[eventIdentifier], e.dataBytes[1])
            this.fireControlElement(this.midiInputMappings[eventIdentifier], e.dataBytes[1])
            return
          }
          console.log('NO MAPPING FOR ', eventIdentifier)

      }
      //console.log('handleIncomingMidiEvent', e)
      //console.log('handleIncomingMidiEvent', e.message.channel, e.message.command, e.message.type)
      //const eventIdentifier = `${e.message.channel}-${e.message.command}-${e.message.type}`
    },
    checkFireMidiEvent(arg) {
      if (!window.tmpMidiOut) {
        return
      }
      // console.log('checkFireMidiEvent', arg)
      if (typeof midiOutputMapping[arg] === 'undefined') {
        console.log('no output mapping found', arg)
        return
      }
      this.fireMidiEvent(
        midiOutputMapping[arg][0],
        midiOutputMapping[arg][1]
      )
    },
    fireMidiEvent(funcName, args) {
      window.tmpMidiOut[funcName](...args)
    }
  }
})

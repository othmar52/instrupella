import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import rangeMixin from './mixins/utils/range'

const { range } = rangeMixin()

const ctrlKeyToFunc = (ctrlKey) => {
  const match = /^d\.(\d*)\.(.*)$/.exec(ctrlKey)
  if (match && ctrlMap[match[2]]) {
    return [parseInt(match[1]), ctrlMap[match[2]]]
  }
  console.log('ERROR ctrlKeyToFunc', ctrlKey)
}

const midiMapping = {
  '2-noteon-0': 'd.0.togglePlayMidi',
  '16-noteon-55': 'd.0.toggleMuteMidi',
  '16-noteon-66': 'd.0.toggleHotCueDeleteMode',
  '2-controlchange-6': 'd.0.handleJogWheelRotate',
  '16-controlchange-12': 'd.0.setVolumeMidi',
  '6-noteon-1': 'd.0.hotCue1DownMidi',
  '6-noteoff-1': 'd.0.hotCue1UpMidi',
  '6-noteon-2': 'd.0.hotCue2DownMidi',
  '6-noteoff-2': 'd.0.hotCue2UpMidi',
  '6-noteon-3': 'd.0.hotCue3DownMidi',
  '6-noteoff-3': 'd.0.hotCue3UpMidi',
  '6-noteon-4': 'd.0.hotCue4DownMidi',
  '6-noteoff-4': 'd.0.hotCue4UpMidi'
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
  'toggleHotCueDeleteMode': 'toggleHotCueDeleteMode'
}

export const useMainStore = defineStore({
  id: 'main',
  state: () => ({
    midiMappings: useStorage('midiMappings', midiMapping),
    midiLearn: useStorage('midiLearn', false),
    midiLearnItem: useStorage('midiLearnItem', null),
    scrollToTop: useStorage('midiLearn', false),
    trackProps: useStorage('trackProps', []),
    decks: useStorage('decks', []),
    tracks: useStorage('tracks', []),
    editTempo: useStorage('editTempo', 0)
  }),
  getters: {
    getAllMidiMappings() {
      return this.midiMappings
    },
    midiMappingsEmpty() {
      return this.midiMappings === {}
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
    getEditTempo() {
      return this.editTempo
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
    setEditTempo(value) {
      this.editTempo = parseFloat(value)
    },
    setTracks(tracks) {
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
      this.midiMappings.push(midiMapping)
    },
    removeMidiMapping(index) {
      this.midiMappings.splice(index, 1)
    },
    */
    resetMidiMappings() {
      this.midiMappings = midiMapping
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
        currentSecond: 0,
        skipLength: 0.05,
        timestretch: false,
        pixelPerSecond: 400,
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
      console.log('toggleMute', forceNewState)
      if (forceNewState === null) {
        this.decks[deckIndex].mute = !this.decks[deckIndex].mute
        return
      }
      this.decks[deckIndex].mute = forceNewState
    },
    toggleMuteMidi(deckIndex) {
      // drop incoming data byte as argument
      this.toggleMute(deckIndex, null)
    },
    togglePlayMidi(deckIndex, forceNewState=null) {
      this.decks[deckIndex].play = !this.decks[deckIndex].play
    },
    togglePlay(deckIndex, forceNewState=null) {
      if (forceNewState === null) {
        this.decks[deckIndex].play = !this.decks[deckIndex].play
        return
      }
      this.decks[deckIndex].play = forceNewState
    },
    loadTrack(deckIndex, trackIndex) {
      this.setScrollToTop(true)
      this.decks[deckIndex].track = this.tracks[trackIndex]
      this.setEditTempo(0)
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
    setPlaybackRate(deckIndex, playbackRate) {
      this.decks[deckIndex].playbackRate = playbackRate
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
        return
      }
      this.decks[deckIndex].hotCues.playStateOnCueStart = this.decks[deckIndex].play
      this.decks[deckIndex].seekToSecondAndPlay = this.decks[deckIndex].hotCues.cues[hotCueIndex].second
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
        return
      }
      // console.log('pressHotCueEnd', idx, 'props.play', props.play, 'playStateOnCueStart', playStateOnCueStart.value)
      if (this.decks[deckIndex].hotCues.playStateOnCueStart === false) {
        this.decks[deckIndex].seekToSecondAndStop = this.decks[deckIndex].hotCues.cues[hotCueIndex].second
      }
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
      // console.log('relativeValue', relativeValue, parseFloat(duration * relativeValue))
      this[directionFunc](deckIndex, parseFloat(duration * relativeValue))
    },
    handleIncomingMidiEvent(e) {
      switch(e.message.type) {
        case 'noteon':
        case 'noteoff':
        case 'controlchange':
          const eventIdentifier = `${e.message.channel}-${e.message.type}-${e.dataBytes[0]}`
          if (typeof this.midiMappings[eventIdentifier] !== 'undefined') {
            console.log('SUCCESS', eventIdentifier, this.midiMappings[eventIdentifier], e.dataBytes[1])
            this.fireControlElement(this.midiMappings[eventIdentifier], e.dataBytes[1])
            return
          }
          console.log('NO MAPPING FOR ', eventIdentifier)

      }
      //console.log('handleIncomingMidiEvent', e)
      //console.log('handleIncomingMidiEvent', e.message.channel, e.message.command, e.message.type)
      //const eventIdentifier = `${e.message.channel}-${e.message.command}-${e.message.type}`
    }
  }
})

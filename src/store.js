import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

import WaveSurfer from 'wavesurfer.js'
import MinimapPlugin from 'wavesurfer.js/src/plugin/minimap/index.js'
import MarkersPlugin from 'wavesurfer.js/src/plugin/markers/index.js'
import TimelinePlugin from 'wavesurfer.js/src/plugin/timeline/index.js'
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
  '16-noteon-55': 'd.0.toggleMuteMidi',
  '16-noteon-66': 'd.0.toggleHotCueDeleteMode',
  '16-controlchange-45': 'd.0.handleJogWheelRotate'
}
const ctrlMap = {
  'toggleMute': 'toggleMute',
  'toggleMuteMidi': 'toggleMuteMidi',
  'togglePlay': 'togglePlay',
  'setVolume': 'setVolume',
  'nudgeAhead': 'nudgeAhead',
  'nudgeBehind': 'nudgeBehind',
  'seekToSecond': 'seekToSecond',
  'handleJogWheelRotate': 'handleJogWheelRotate',
  'hotCueDown': 'hotCueDown',
  'hotCueUp': 'hotCueUp',
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
    tracks: useStorage('tracks', [])
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
    setTracks(tracks) {
      this.tracks = tracks
    },
    addTrackProp(trackProp) {
      // console.log('store.addTrackProp() to', trackProp)
      const index = this.trackProps.findIndex(item => item.path === trackProp.path)
      if (index === -1) {
        this.trackProps.push(trackProp)
        return
      }
      for (const [key, value] of Object.entries(trackProp)) {
        this.trackProps[index][key] = value
      }
      // console.log('existing index', index)
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
    setPlaybackRate(deckIndex, playbackRate) {
      this.decks[deckIndex].playbackRate = playbackRate
    },
    setCurrentSecond(deckIndex, currentSecond) {
      // console.log('store.setCurrentSec', currentSecond)
      this.decks[deckIndex].currentSecond = parseFloat(currentSecond)
    },
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
      if (midiValue === 1) {
        this.nudgeAhead(deckIndex)
        return
      }
      if (midiValue === 127) {
        this.nudgeBehind(deckIndex)
        return
      }
      if (midiValue < 64) {
        this.decks[deckIndex].skipLength = midiValue * midiValue * midiValue * 0.1
        this.nudgeAhead(deckIndex)
        this.decks[deckIndex].skipLength = 0.05
      }
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
          console.log('NO MAPPING FOR ', eventIdentifier, this.midiMappings)

      }
      //console.log('handleIncomingMidiEvent', e)
      //console.log('handleIncomingMidiEvent', e.message.channel, e.message.command, e.message.type)
      //const eventIdentifier = `${e.message.channel}-${e.message.command}-${e.message.type}`
    }
  }
})

import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { useMidiStore } from "@/midistore.js";
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

const ctrlMap = {
  'toggleSync': 'toggleSync',
  'toggleSyncMidi': 'toggleSyncMidi',
  'loopFocus': 'loopFocus',
  'handleBrowseWheelRotate': 'handleBrowseWheelRotate',
  'sniffAudioStart': 'sniffAudioStart',
  'sniffAudioStartMidi': 'sniffAudioStartMidi',
  'loadTrackMidi': 'loadTrackMidi',
  'sniffAudioStop': 'sniffAudioStop',
  'sniffRandomAudioStartMidi': 'sniffRandomAudioStartMidi',
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
  'setBpmFilterMidi': 'setBpmFilterMidi',
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
    midistorage: useMidiStore(),
    midiLearn: false,
    midiLearnItem: null,
    midiShift: 0,
    bpmFilterMidi: 0,
    showBlazingBaton: true,
    trackProps: useStorage('trackProps', []),
    decks: [],
    tracks: [],
    hotCueAmount: 4,
    workingTempo: 0,
    workingDownbeat: 0,
    sniffAudioSegment: 0,
    sniffAudioTrack: {},
    sniffAudioNode: null,
    sniffAudioIsPlaying: -1,
    scrollToTop: false,
    scrollToTrackList: false,
    scrollToNextTrack: false,
    scrollToPreviousTrack: false,
    scrollToFocusedTrack: false,
    scrollToRandomTrack: false,
    currentTrackFocus: null,
    loadCurrentTrackFocusToDeck: false,
    focusItems: ['top', 'track-list'],
    currentFocus: 0
  }),
  getters: {
    getMidiLearn() {
      return this.midiLearn <= 0
    },
    getShowBlazingBaton() {
      return this.showBlazingBaton
    },
    getBpmFilterMidi() {
      return this.bpmFilterMidi
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
    getHotCueAmount() {
      return this.hotCueAmount
    },
    getScrollToTop() {
      return this.scrollToTop
    },
    getScrollToTrackList() {
      return this.scrollToTrackList
    },
    getWorkingTempo() {
      return this.workingTempo
    },
    getWorkingDownbeat() {
      return this.workingDownbeat
    },
    getSniffAudioTrack() {
      return this.sniffAudioTrack
    },
    getSniffAudioNode() {
      return this.sniffAudioNode
    },
    getSniffAudioIsPlaying() {
      return this.sniffAudioIsPlaying
    },
    getCurrentTrackFocus() {
      return this.currentTrackFocus
    },
    getLoadCurrentTrackFocusToDeck() {
      return this.loadCurrentTrackFocusToDeck
    }
  },
  actions: {
    fireControlElement(controlId, value=null) {
      const deckCtrlParams = ctrlKeyToFunc(controlId)
      if (!deckCtrlParams) {
        return
      }
      if(this.midiLearnItem !== null) {
        this.addMidiMapping(controlId)
        return
      }
      this[deckCtrlParams[1]](deckCtrlParams[0], value)
    },
    setScrollToTop(value) {
      this.scrollToTop = value
    },
    setScrollToTrackList(value) {
      this.scrollToTrackList = value
    },
    setScrollToNextTrack(value) {
      this.scrollToNextTrack = value
    },
    setScrollToPreviousTrack(value) {
      this.scrollToPreviousTrack = value
    },
    setScrollToFocusedTrack(value) {
      this.scrollToFocusedTrack = value
    },
    setScrollToRandomTrack(value) {
      this.scrollToRandomTrack = value
    },
    setCurrentTrackFocus(track) {
      this.currentFocus = 1
      this.currentTrackFocus = track
    },
    setLoadCurrentTrackFocusToDeck(deckIndex) {
      this.loadCurrentTrackFocusToDeck = deckIndex
    },
    setBpmFilterMidi(deckIndex, midiValue) {
      this.bpmFilterMidi = midiValue
    },
    loopFocus() {
      if (this.currentFocus == 0) {
        this.currentFocus = 1
        if (this.currentTrackFocus !== null) {
          this.scrollToFocusedTrack = true
          return
        }
        this.scrollToTrackList = true
        return
      }
      this.currentFocus = 0
      this.scrollToTop = true
    },
    handleBrowseWheelRotate(deckIndex, midiValue) {
      if (this.currentFocus === 0 && this.currentTrackFocus !== null) {
        this.scrollToFocusedTrack = true
        this.currentFocus = 1
        return
      }
      if (midiValue === 1) {
        this.scrollToNextTrack = true
        return
      }
      this.scrollToPreviousTrack = true
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
      for (const deckIndex of this.decks.keys()) {
        this.toggleHotCueDeleteMode(deckIndex, true)
      }
    },
    midiShiftOff() {
      //console.log('midiShift', 0)
      this.midiShift = 0
      for (const deckIndex of this.decks.keys()) {
        this.toggleHotCueDeleteMode(deckIndex, false)
      }
    },
    setShowBlazingBaton(value) {
      this.showBlazingBaton = value
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
        silences: [],
        tempoDrift: false,
        downbeatDrift: false,
        like: 0,
        beat: null,
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
    clearTrackProps() {
      this.trackProps = []
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
    toggleMidiLearn() {
      this.midiLearn = !this.midiLearn
      // console.log('store.toggleMidiLearn() to', this.midiLearn)
    },
    getDeckIndexForTrackId(trackId) {
      for (const idx in this.decks) {
        if (!this.decks[idx].track) {
          continue
        }
        if (this.decks[idx].track.id === trackId) {
          return idx
        }
      }
      return -1
    },
    getDefaultHotCues() {
      const hotCues = {
        deleteMode: false,
        nowPlaying: false, // for ignoring stop() during cue hold
        stopAfterRelease: false,
        ignoreNextEndEvent: false,
        haveAnyCues: false,
        cues: []
      }
      // TODO: read persisted hot cues for track
      for (const idx in range(0, this.hotCueAmount)) {
        hotCues.cues.push({
          down: false,
          up: false,
          second: null
        })
      }
      return hotCues
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
        sync: false,
        volume: 1,
        playbackRate: 1,
        pitchRange: 0.1,
        tempoFactor: 1, // normal, double or half tempo
        currentSecond: 0,
        skipLength: 0.05,
        timestretch: false,
        pixelPerSecond: 500,
        jogWheelDebounce: 0,
        hotCues: this.getDefaultHotCues(),

        // control helpers
        nudgeAhead: 0,
        nudgeBehind: 0,
        seekToSecond: -1,
        seekToSecondAndPlay: -1,
        seekToSecondAndStop: -1,
        hotCuesChange: false
      }
      this.decks.push(deck)
    },
    setPixelsPerSecond(deckIndex, pxPerSec) {
      this.decks[deckIndex].pixelPerSecond = parseInt(pxPerSec)
    },
    zoomIn(deckIndex) {
      if (this.decks[deckIndex].pixelPerSecond >= 700) {
        return
      }
      if (this.decks[deckIndex].pixelPerSecond === 50) {
        this.setPixelsPerSecond(deckIndex, 100)
        return
      }
      this.setPixelsPerSecond(deckIndex, this.decks[deckIndex].pixelPerSecond + 100)
    },
    zoomOut(deckIndex) {
      if (this.decks[deckIndex].pixelPerSecond <= 50) {
        return
      }
      if (this.decks[deckIndex].pixelPerSecond <= 100) {
        this.setPixelsPerSecond(deckIndex, 50)
        return
      }
      this.setPixelsPerSecond(deckIndex, this.decks[deckIndex].pixelPerSecond - 100)
    },
    toggleMute(deckIndex, forceNewState=null) {
      // console.log('toggleMute', forceNewState)
      const newMuteState = (forceNewState === null)
        ? !this.decks[deckIndex].mute
        : forceNewState
      this.decks[deckIndex].mute = newMuteState
      this.midistorage.checkFireMidiEvent(
        newMuteState
          ? `d.${deckIndex}.muteOn`
          : `d.${deckIndex}.muteOff`
      )
    },
    toggleSync(deckIndex, forceNewState=null) {
      const newSyncState = (forceNewState === null)
        ? !this.decks[deckIndex].sync
        : forceNewState
      this.decks[deckIndex].sync = newSyncState
      this.midistorage.checkFireMidiEvent(
        newSyncState
          ? `d.${deckIndex}.syncOn`
          : `d.${deckIndex}.syncOff`
      )
    },
    toggleSyncMidi(deckIndex) {
      // drop incoming data byte as argument
      this.toggleSync(deckIndex, null)
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

      this.midistorage.checkFireMidiEvent(
        newPlayState
          ? `d.${deckIndex}.play`
          : `d.${deckIndex}.pause`
      )
      if (this.decks[deckIndex].hotCues.nowPlaying === true && newPlayState === false) {
        this.decks[deckIndex].hotCues.stopAfterRelease = true
        return
      }
      this.decks[deckIndex].play = newPlayState
    },
    loadTrackByPath(deckIndex, path) {
      const trackResult = this.tracks.filter(item => item.path === path)
      if (trackResult.length === 0) {
        return
      }
      this.loadTrack(deckIndex, trackResult[0].id)
    },
    loadTrackMidi(deckIndex) {
      this.setLoadCurrentTrackFocusToDeck(deckIndex)
    },
    loadTrack(deckIndex, trackIndex) {
      this.setScrollToTop(true)
      this.currentFocus = 0
      this.setWorkingTempo(getBpm(this.tracks[trackIndex]))
      this.setWorkingDownbeat(
        (this.tracks[trackIndex].downbeat !== null)
          ? parseFloat(this.tracks[trackIndex].downbeat)
          : 0
      )
      this.decks[deckIndex].track = this.tracks[trackIndex]
      this.decks[deckIndex].tempoFactor = 1
      this.decks[deckIndex].currentSecond = 0
      this.togglePlay(deckIndex, false)
      this.toggleMute(deckIndex, false)
      // TODO: read persisted hot cues from track
      this.decks[deckIndex].hotCues = {
        deleteMode: false,
        nowPlaying: false,
        stopAfterRelease: false,
        ignoreNextEndEvent: false,
        haveAnyCues: false,
        cues: []
      }
      this.decks[deckIndex].hotCues = this.getDefaultHotCues()
      for (const idx in range(0, this.hotCueAmount)) {
        this.midistorage.checkFireMidiEvent(`d.${deckIndex}.hotCue${1+idx*1}Off`)
      }
      this.setHotCuesChange(deckIndex, true)
    },
    analyzeTrackPostHook(deckIndex) {
      // TODO make auto seek configurable
      if (this.decks[deckIndex].track.silences.length === 0) {
        return
      }
      if (this.decks[deckIndex].track.silences[0].start > 0) {
        return
      }
      this.seekToSecond(deckIndex, this.decks[deckIndex].track.silences[0].end)
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
      if (!this.sniffAudioNode) {
        return
      }
      this.sniffAudioNode.volume = volume
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
    setPitchRange(deckIndex, pitchRange) {
      this.decks[deckIndex].pitchRange = pitchRange
    },
    setPlaybackRate(deckIndex, playbackRate) {
      this.decks[deckIndex].playbackRate = playbackRate
    },
    setPlaybackRateMidi(deckIndex, midiCCValue) {
      let newPlayBackrate = 1
      switch(true) {
        case midiCCValue > 64:
          newPlayBackrate = mapValue(midiCCValue, 64, 127, 1, 1 + this.decks[deckIndex].pitchRange)
          break
        case midiCCValue < 64:
          newPlayBackrate = mapValue(midiCCValue, 0, 64, 1 - this.decks[deckIndex].pitchRange, 1)
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
        this.midistorage.checkFireMidiEvent(`d.${deckIndex}.hotCue${1+hotCueIndex*1}Dimmed`)
        return
      }
      this.decks[deckIndex].hotCues.nowPlaying = true
      this.decks[deckIndex].seekToSecondAndPlay = this.decks[deckIndex].hotCues.cues[hotCueIndex].second
      this.midistorage.checkFireMidiEvent(`d.${deckIndex}.hotCue${1+hotCueIndex*1}On`)
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
        this.midistorage.checkFireMidiEvent(`d.${deckIndex}.hotCue${1+hotCueIndex*1}Off`)
        return
      }
      this.decks[deckIndex].hotCues.nowPlaying = false
      if (this.decks[deckIndex].play === false || this.decks[deckIndex].hotCues.stopAfterRelease === true) {
        this.decks[deckIndex].seekToSecondAndStop = this.decks[deckIndex].hotCues.cues[hotCueIndex].second
      }
      if (this.decks[deckIndex].hotCues.stopAfterRelease === true) {
        this.decks[deckIndex].play = false
        this.decks[deckIndex].hotCues.stopAfterRelease = false
      }
      this.midistorage.checkFireMidiEvent(`d.${deckIndex}.hotCue${1+hotCueIndex*1}Dimmed`)
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
    sniffAudioStartMidi() {
      if (this.currentTrackFocus !== null) {
        this.sniffAudioStart(this.currentTrackFocus)
      }
    },
    // try to avoid silence for playing a random timestamp
    getSniffAudioTimestamp(track, segment, maxSegments) {
      let targetTimestamp = segment * track.length/maxSegments
      if (segment === 0 && track.downbeat > 0) {
        targetTimestamp = track.downbeat
      }
      if (track.silences.length === 0) {
        return targetTimestamp
      }
      for (const silence of track.silences) {
        if (targetTimestamp >= silence.start && targetTimestamp <= silence.end) {
          return (silence.end < track.length)
            ? silence.end
            : silence.begin - 3
        }
      }
      return targetTimestamp
    },
    sniffAudioStart(track) {
      this.currentFocus = 1
      const maxSegments = 7
      if (!this.sniffAudioTrack || this.sniffAudioTrack.id !== track.id) {
        this.sniffAudioTrack = track
        this.sniffAudioNode = new Audio(track.path)
        this.sniffAudioSegment = 0
      } else {
        this.sniffAudioSegment ++
      }
      if (this.sniffAudioSegment > maxSegments-1) {
        this.sniffAudioSegment = 0
      }
      this.sniffAudioNode.currentTime = this.getSniffAudioTimestamp(
        track,
        this.sniffAudioSegment,
        maxSegments
      )
      // TODO: does it make sense to have a separate volume control?
      // for now use volume from deck 1
      this.sniffAudioNode.volume = this.decks[0].volume
      this.sniffAudioNode.play()
      this.sniffAudioIsPlaying = this.sniffAudioTrack.id
    },
    sniffRandomAudioStartMidi() {
      this.scrollToRandomTrack = true
    },
    sniffAudioStop() {
      // console.log('sniffAudioStop')
      if (this.sniffAudioNode) {
        this.sniffAudioNode.pause()
        this.sniffAudioIsPlaying = -1
      }
    }
  }
})

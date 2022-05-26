import { defineStore } from 'pinia'
import { WebMidi } from 'webmidi'
import { useMainStore } from '@/store.js';
import getNegativeDownbeatMixin from './mixins/utils/negativeDownbeat'
import getSecondsPerQuarterNoteMixin from './mixins/utils/secondsPerQuarterNote'
const { getSecondsPerQuarterNote } = getSecondsPerQuarterNoteMixin()

const { getNegativeDownbeat } = getNegativeDownbeatMixin()

const DJ2GO2 = 'DJ2GO2'
const CONTROLHUB = 'CONTROL Hub'
const USBMIDICABLE = 'USB Midi Cable'
const DIGITAKT = 'Elektron Digitakt'

const midiInputMainMappings = {
  [DJ2GO2]: {
    '16-noteon-6': 'g.loopFocus',
    '16-noteon-2': 'g.sniffAudioStartMidi',
    '16-noteoff-2': 'g.sniffAudioStop',
    '5-noteon-1': 'g.sniffRandomAudioStartMidi',
    '5-noteoff-1': 'g.sniffAudioStop',
    '16-noteon-3': 'd.0.loadTrackMidi',
    '16-controlchange-0': 'g.handleBrowseWheelRotate',
    '16-controlchange-12': 'g.setBpmFilterMidi',
    '2-noteon-0': 'd.0.togglePlayMidi',
    '2-noteon-27': 'd.0.toggleMuteMidi',
    '2-noteoff-27': 'd.0.toggleMuteMidi',
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
}

const midiOutputMappings = {
  [DJ2GO2]: {
    'd.0.muteOn': ['sendNoteOn', [27, [2], { rawAttack: 1 }]],
    'd.0.muteOff': ['sendNoteOn', [27, [2], { rawAttack: 0 }]],
    'd.0.play': ['sendNoteOn', [0, [2], { rawAttack: 2 }]],
    'd.0.pause': ['sendNoteOn', [0, [2], { rawAttack: 1 }]],
    'd.0.hotCue1Off': ['sendNoteOn', [1, [6], { rawAttack: 0 }]],
    'd.0.hotCue1Dimmed': ['sendNoteOn', [1, [6], { rawAttack: 1 }]],
    'd.0.hotCue1On': ['sendNoteOn', [1, [6], { rawAttack: 2 }]],
    'd.0.hotCue2Off': ['sendNoteOn', [2, [6], { rawAttack: 0 }]],
    'd.0.hotCue2Dimmed': ['sendNoteOn', [2, [6], { rawAttack: 1 }]],
    'd.0.hotCue2On': ['sendNoteOn', [2, [6], { rawAttack: 2 }]],
    'd.0.hotCue3Off': ['sendNoteOn', [3, [6], { rawAttack: 0 }]],
    'd.0.hotCue3Dimmed': ['sendNoteOn', [3, [6], { rawAttack: 1 }]],
    'd.0.hotCue3On': ['sendNoteOn', [3, [6], { rawAttack: 2 }]],
    'd.0.hotCue4Off': ['sendNoteOn', [4, [6], { rawAttack: 0 }]],
    'd.0.hotCue4Dimmed': ['sendNoteOn', [4, [6], { rawAttack: 1 }]],
    'd.0.hotCue4On': ['sendNoteOn', [4, [6], { rawAttack: 2 }]]
  }
}
const addGuiElementClass = {
  [DJ2GO2]: {
    'd.0.loadTrack': 'invisible',
    'd.0.toBegin': 'invisible',
    'd.0.pitchSlider': 'slider-small',
    'd.0.volumeSlider': 'slider-small',
    'd.0.nudgeBehind': 'invisible',
    'd.0.nudgeAhead': 'invisible'
  }
}

export const useMidiStore = defineStore({
  id: 'midi',
  state: () => ({
    mainstorage: useMainStore(),
    webmidi: WebMidi,
    midiAvailable: false,
    midiInputPorts: [],
    midiOutputPorts: [],
    midiInputMain: null,
    midiInputClock: null,
    midiOutput: null,
    midiInputMainPriority: [DJ2GO2, CONTROLHUB],
    midiInputClockPriority: [DIGITAKT, USBMIDICABLE, CONTROLHUB],
    midiOutputPriority: [DJ2GO2],
    midiInputMainMapping: null,
    midiOutputMapping: null,
    midiInputMainGuiElementClasses: null,
    clock: {
      isRunning: false,
      tickCounter: 0,
      currentTempoTrackDivision: 0.25,
      quarterNoteCounter: 0,
      timestampLastQuarterNote: null,
      timestampLastBar: null,
      timestampLast4Bar: null,
      timestampLast16Bar: null,
      secondsPerQuarterNote: 0,
      ppqn: 24,
      tempo: 0
    },
    guiAlerts: []
  }),
  getters: {
    getMidiInputPorts() {
      return this.midiInputPorts
    },
    getMidiOutputPorts() {
      return this.midiOutputPorts
    },
    getHaveClockDevice() {
      return this.midiInputClock !== null
    },
    getExternalClockTempo() {
      return parseFloat(this.clock.tempo)
    },
    getExternalClockIsRunning() {
      return this.clock.isRunning
    },
    getExternalClockQuarterNoteCounter() {
      return this.clock.quarterNoteCounter
    },
    getHaveGuiAlerts() {
      return this.guiAlerts.length > 0
    },
    getGuiAlerts() {
      return this.guiAlerts
    }
  },
  actions: {
    getAdditionalClassForGuiElement(guiElementIdentifier) {
      if (!this.midiInputMainGuiElementClasses) {
        return ''
      }
      if (guiElementIdentifier in this.midiInputMainGuiElementClasses) {
        return this.midiInputMainGuiElementClasses[guiElementIdentifier]
      }
    },
    setMidiInputPorts(value) {
      this.getMidiInputPorts = value
    },
    setMidiOutputPorts(value) {
      this.midiOutputPorts = value
    },
    setGuiAlerts(value) {
      this.guiAlerts = value
    },
    addGuiAlert(value) {
      this.guiAlerts.push(value)
    },
    checkInitMidi() {
      this.webmidi.enable((err) => {
        if (!err) {
          this.midiAvailable = true
          this.initMidi()
          return
        }
        this.addGuiAlert({
          content: 'WebMidi could not be enabled.',
          alertType: 'alert-danger'
        })
      })
    },
    initMidi() {
      this.setupMidiPorts()
      this.webmidi.addListener('connected', e => {
        this.setupMidiPorts()
      })
      this.webmidi.addListener('disconnected', e => {
        this.setupMidiPorts()
      })
    },
    setupMidiPorts() {
      this.midiInputPorts = this.webmidi.inputs
      this.midiOutputPorts = this.webmidi.outputs
      this.setupMidiPort('midiInputMain', 'midiInputPorts')
      this.setupMidiPort('midiOutput', 'midiOutputPorts')
      this.setupMidiPort('midiInputClock', 'midiInputPorts')
    },
    setupMidiPort(portType, portPool) {
      let midiPort = null
      let portIdentifier = null
      for (const searchPort of this[`${portType}Priority`]) {
        midiPort = this.searchMidiPort(portPool, searchPort)
        if (midiPort !== null) {
          portIdentifier = searchPort
          break
        }
      }
      // scenario 1: currently no attached port but we have one to attach
      if (this[portType] === null && midiPort !== null) {
        this[portType] = midiPort
        this[`${portType}SetupCallback`](portIdentifier)
        this.addGuiAlert({
          content: `${portType} ${this[portType].name}`,
          alertType: 'alert-success'
        })
        return
      }
      // scenario 2: attached port is still the target port
      if (this[portType] !== null && midiPort !== null
        && this[portType].id === midiPort.id) {
        // console.log('no change of midiInputMain')
        return
      }
      // scenario 3: attached port is not available anymore
      if (this[portType] !== null && midiPort === null) {
        this[portType].removeListener()
        this.addGuiAlert({
          content: `${portType} ${this[portType].name} is gone`,
          alertType: 'alert-danger'
        })
        this[portType] = null
        this[`${portType}Mapping`] = null
        this[`${portType}GuiElementClasses`] = null
        return
      }
      // scenario 4: attached port is different from priority port
      if (this[portType] !== null && midiPort !== null
        && this[portType].id !== midiPort.id) {
        this[portType].removeListener()
        this.addGuiAlert({
          content: `CHANGE ${portType} from ${this[portType].name} to ${midiPort.name}`,
          alertType: 'alert-success'
        })
        this[portType] = midiPort
        this[`${portType}SetupCallback`](portIdentifier)
        return
      }
    },
    searchMidiPort(portType, portName) {
      for (const item of this[portType]) {
        if (item.name.toUpperCase().indexOf(portName.toUpperCase()) !== -1) {
          return item
        }
      }
      return null
    },
    midiInputMainSetupCallback(portIdentifier) {
      this.midiInputMainMapping = midiInputMainMappings[portIdentifier] || {}
      this.midiInputMainGuiElementClasses = addGuiElementClass[portIdentifier]
      this.midiInputMain.addListener('midimessage', midiEvent => {
        switch (midiEvent.message.type) {
          case 'clock':
          case 'start':
          case 'stop':
            break
          default:
            this.handleIncomingMidiEvent(midiEvent)
        }
      })
    },
    midiInputClockNext16Bars(currentMillisecond) {
      let newTempo = null
      if (this.mainstorage.getIsBusy === true) {
        this.clock.timestampLastQuarterNote = null
        this.clock.timestampLastBar = null
        this.clock.timestampLast4Bar = null
        this.clock.timestampLast16Bar = null
        return newTempo
      }
      this.clock.timestampLastQuarterNote = currentMillisecond
      this.clock.timestampLastBar = currentMillisecond
      this.clock.timestampLast4Bar = currentMillisecond
      if (this.clock.timestampLast16Bar !== null) {
        newTempo = 60000 / ((currentMillisecond - this.clock.timestampLast16Bar) / 64)
      }
      this.clock.timestampLast16Bar = currentMillisecond
      return newTempo
    },
    midiInputClockNext4Bars(currentMillisecond) {
      let newTempo = null
      if (this.mainstorage.getIsBusy === true) {
        this.clock.timestampLastQuarterNote = null
        this.clock.timestampLastBar = null
        this.clock.timestampLast4Bar = null
        return newTempo
      }
      this.clock.timestampLastQuarterNote = currentMillisecond
      this.clock.timestampLastBar = currentMillisecond

      if (this.clock.currentTempoTrackDivision > 4) {
        // at this point only greater divisions are used for tempo calculation
        this.clock.timestampLast4Bar = currentMillisecond
        return newTempo
      }

      if (this.clock.timestampLast16Bar !== null && this.clock.quarterNoteCounter % 64 === 49) {
        // console.log('increase currentTempoTrackDivision', 16)
        this.clock.currentTempoTrackDivision = 16
        this.clock.timestampLast4Bar = currentMillisecond
        return null
      }
      if (this.clock.timestampLast4Bar !== null) {
        newTempo = 60000 / ((currentMillisecond - this.clock.timestampLast4Bar) / 16)
      }
      this.clock.timestampLast4Bar = currentMillisecond
      return newTempo
    },
    midiInputClockNextBar(currentMillisecond) {
      let newTempo = null
      const timestampTempoCalculation = this.clock.timestampLastBar
      this.clock.timestampLastBar = currentMillisecond
      if (this.mainstorage.getIsBusy === true) {
        this.clock.timestampLastQuarterNote = null
        this.clock.timestampLastBar = null
        return newTempo
      }
      this.clock.timestampLastQuarterNote = currentMillisecond
      if (this.clock.currentTempoTrackDivision > 1) {
        // at this point only greater divisions are used for tempo calculation
        return newTempo
      }

      if (this.clock.timestampLast4Bar !== null && this.clock.quarterNoteCounter % 16 === 13) {
        // console.log('increase currentTempoTrackDivision', 4)
        this.clock.currentTempoTrackDivision = 4
        return null
      }
      // console.log('this.clock.quarterNoteCounter % 16', this.clock.quarterNoteCounter % 16)
      if (timestampTempoCalculation !== null) {
        newTempo = 60000 / ((currentMillisecond - timestampTempoCalculation) / 4)
      }
      return newTempo
    },
    midiInputClockNextQuarter(currentMillisecond) {
      let newTempo = null
      const timestampTempoCalculation = this.clock.timestampLastQuarterNote
      this.clock.timestampLastQuarterNote = currentMillisecond
      if (this.mainstorage.getIsBusy === true) {
        this.clock.timestampLastQuarterNote = null
        return newTempo
      }
      if (this.clock.currentTempoTrackDivision > 0.25) {
        // at this point only greater divisions are used for tempo calculation
        return newTempo
      }
      if (timestampTempoCalculation === null) {
        return newTempo
      }

      if (this.clock.timestampLastBar !== null && this.clock.quarterNoteCounter % 4 === 3) {
        // console.log('increase currentTempoTrackDivision', 1)
        this.clock.currentTempoTrackDivision = 1
        return null
      }
      const milliSecondsPerQuarterNote = currentMillisecond - timestampTempoCalculation
      newTempo = 60000 / milliSecondsPerQuarterNote
      return newTempo
    },
    midiInputClockSetupCallback(portIdentifier) {
      this.midiInputClock.addListener('midimessage', midiEvent => {
        switch (midiEvent.message.type) {
          case 'start':
            this.resetCockHelperVars()
            this.clock.isRunning = true
            return
          case 'stop':
            this.resetCockHelperVars()
            this.clock.isRunning = false
            return
          case 'clock':
            this.clock.tickCounter++
            if (this.clock.tickCounter % this.clock.ppqn !== 0) {
              return
            }
            this.clock.quarterNoteCounter++
            const currentMillisecond = performance.now()
            let newTempo = null
            switch(1) {
              case this.clock.quarterNoteCounter % 64:
                newTempo = this.midiInputClockNext16Bars(currentMillisecond)
                newTempo && console.log('newTempo tracked from 16 bars', newTempo)
                break
              case this.clock.quarterNoteCounter % 16:
                newTempo = this.midiInputClockNext4Bars(currentMillisecond)
                newTempo && console.log('newTempo tracked from 4 bars', newTempo)
                break
              case this.clock.quarterNoteCounter % 4:
                newTempo = this.midiInputClockNextBar(currentMillisecond)
                newTempo && console.log('newTempo tracked from 1 bar', newTempo)
                break
              default:
                newTempo = this.midiInputClockNextQuarter(currentMillisecond)
                newTempo && console.log('newTempo tracked from quarter note', newTempo)
                break
            }

            if (newTempo > 40 && newTempo < 250) {
              this.clock.tempo = newTempo
              this.clock.secondsPerQuarterNote = 60 / this.clock.tempo
            }
            if (this.clock.quarterNoteCounter % 4 === 2 ) {
              this.mainstorage.syncTempoToExternalClock(this.clock.tempo)
            }
            return
          default:
            break
        }
      })
    },
    resetTempoDetection() {
      console.log('resetTempoDetection')
      this.clock.timestampLastQuarterNote = null
      this.clock.timestampLastBar = null
      this.clock.timestampLast4Bar = null
      this.clock.timestampLast16Bar = null
      this.clock.currentTempoTrackDivision = 0.25
      // somtimes mainstorage.analyzeTrackPostHook() is not called...
      this.mainstorage.setBusy(false)
    },
    resetCockHelperVars() {
      this.clock.tickCounter = 0
      this.clock.currentTempoTrackDivision = 0.25
      this.clock.quarterNoteCounter = 1
      this.clock.timestampLastQuarterNote = performance.now()
      this.clock.timestampLastBar = this.clock.timestampLastQuarterNote
      this.clock.timestampLast4Bar = this.clock.timestampLastQuarterNote
      this.clock.timestampLast16Bar = this.clock.timestampLastQuarterNote
    },
    midiOutputSetupCallback(portIdentifier) {
      this.midiOutputMapping = midiOutputMappings[portIdentifier] || {}
      // console.log('midiOutputSetupCallback', portIdentifier)
    },
    handleIncomingMidiEvent(midiEvent) {
      switch (midiEvent.message.type) {
        case 'noteon':
        case 'noteoff':
        case 'controlchange':
          const eventIdentifier = `${midiEvent.message.channel}-${midiEvent.message.type}-${midiEvent.dataBytes[0]}`
          if (typeof this.midiInputMainMapping[eventIdentifier] !== 'undefined') {
            this.mainstorage.fireControlElement(
              this.midiInputMainMapping[eventIdentifier],
              midiEvent.dataBytes[1]
            )
            return
          }
          console.log('NO MAPPING FOR ', eventIdentifier)
      }
    },
    checkFireMidiEvent(arg) {
      if (this.midiOutput === null) {
        return
      }
      if (typeof this.midiOutputMapping[arg] === 'undefined') {
        console.log('no output mapping found', arg)
        return
      }
      this.fireMidiEvent(
        this.midiOutputMapping[arg][0],
        this.midiOutputMapping[arg][1]
      )
    },
    fireMidiEvent(funcName, args) {
      this.midiOutput[funcName](...args)
    },
    getCurrentSyncOffset(deckIndex, resolution = 4) {
      console.log('-------------------------------------------------------')
      console.log('getCurrentSyncOffset')
      console.log('-------------------------------------------------------')
      if (this.clock.isRunning === false) {
        console.log('clock is stop')
        return 0
      }
      if (this.mainstorage.getWorkingTempo === 0) {
        console.log('getWorkingTempo is zero')
        return 0
      }
      if (!this.mainstorage.decks[deckIndex].track) {
        console.log('no track')
        return 0
      }
      const trackDuration = this.mainstorage.decks[deckIndex].track.length
      // TODO: do we need 2nd arg 'overrideTempo'?
      // console.log('track.secondsPerQuarterNote', 60 / this.mainstorage.getWorkingTempo * this.mainstorage.decks[deckIndex].playbackRate)
      const secondsPerQuarterNoteTrack = getSecondsPerQuarterNote(
        this.mainstorage.decks[deckIndex].track
      )
      let secondsPerResolutionTrack = secondsPerQuarterNoteTrack
      let secondsPerResolutionClock = JSON.parse(JSON.stringify(this.clock.secondsPerQuarterNote))
      let lastResolutionTimestampClock = JSON.parse(JSON.stringify(this.clock.timestampLastQuarterNote))/1000
      switch (resolution) {
        case 0.25:
          // already defined as default
          break
        case 1:
          secondsPerResolutionTrack *= 4
          secondsPerResolutionClock *= 4
          lastResolutionTimestampClock = JSON.parse(JSON.stringify(this.clock.timestampLastBar))/1000
          break
        case 4:
          secondsPerResolutionTrack *= 16
          secondsPerResolutionClock *= 16
          lastResolutionTimestampClock = JSON.parse(JSON.stringify(this.clock.timestampLast4Bar))/1000
          break
        default:
          console.log('invalid resolution. valid values are 0.25|1|4')
          return
      }
      const distancePrevResolutionClock = performance.now()/1000 - lastResolutionTimestampClock
      const distanceNextResolutionClock = lastResolutionTimestampClock + secondsPerResolutionClock - performance.now()/1000
      const percentWithinGridClock = distancePrevResolutionClock / (secondsPerResolutionClock / 100)
      
      const negativeDownbeatTrack = getNegativeDownbeat(
        this.mainstorage.getWorkingTempo,
        this.mainstorage.getWorkingDownbeat
      )
      let prevResolutionTrack = negativeDownbeatTrack
      let nextResolutionTrack = negativeDownbeatTrack
      let newDownbeat = negativeDownbeatTrack
      while(newDownbeat < trackDuration + secondsPerResolutionTrack) {
        if (newDownbeat < this.mainstorage.decks[deckIndex].currentSecond) {
          newDownbeat += secondsPerResolutionTrack
          continue
        }
        prevResolutionTrack = newDownbeat - secondsPerResolutionTrack
        nextResolutionTrack = newDownbeat
        break
      }
      const distancePrevResolutionTrack = this.mainstorage.decks[deckIndex].currentSecond - prevResolutionTrack
      const distanceNextResolutionTrack = nextResolutionTrack - this.mainstorage.decks[deckIndex].currentSecond
      const percentWithinGridTrack = distancePrevResolutionTrack / (secondsPerResolutionTrack / 100)

      let targetSecondTrack = 0

      const percentDistance = Math.abs(percentWithinGridTrack - percentWithinGridClock)
      // scenario 1: play has been pressed a little to late
      // example 1
      //    percentWithinGridClock = 30
      //    percentWithinGridTrack = 20
      // example 2
      //    percentWithinGridClock = 5
      //    percentWithinGridTrack = 90
      if (percentWithinGridClock > percentWithinGridTrack
        && percentWithinGridClock - percentWithinGridTrack < 50) {
        console.log('ex 1', percentWithinGridClock, percentWithinGridTrack)
        // force track percent within grid same as clock percent within grid
        targetSecondTrack = prevResolutionTrack + percentWithinGridClock * (secondsPerResolutionTrack/100)
      }
      if (percentWithinGridClock < percentWithinGridTrack
        && percentWithinGridClock + 100 - percentWithinGridTrack < 50) {
        console.log('ex 2', percentWithinGridClock, percentWithinGridTrack)
        // force track percent within grid same as clock percent within grid
        // but in next resolution sector
        targetSecondTrack = nextResolutionTrack + percentWithinGridClock * (secondsPerResolutionTrack/100)
      }
      // scenario 2: play has been pressed a little to early
      // example 3
      //    percentWithinGridClock = 20
      //    percentWithinGridTrack = 30
      // example 4
      //    percentWithinGridClock = 90
      //    percentWithinGridTrack = 5
      if (percentWithinGridClock < percentWithinGridTrack
        && percentWithinGridTrack - percentWithinGridClock < 50) {
        console.log('ex 3', percentWithinGridClock, percentWithinGridTrack)
        // force track percent within grid same as clock percent within grid
        // TODO consider to wait for x seconds to really start playing
        targetSecondTrack = prevResolutionTrack + percentWithinGridClock * (secondsPerResolutionTrack/100)
      }
      if (percentWithinGridClock > percentWithinGridTrack
        && percentWithinGridTrack+100 - percentWithinGridClock < 50) {
        console.log('ex 4', percentWithinGridClock, percentWithinGridTrack)
        // force track percent within PREVIOUS grid same as clock percent within grid
        // TODO consider to wait for x seconds to really start playing
        targetSecondTrack = prevResolutionTrack-secondsPerResolutionTrack + percentWithinGridClock * (secondsPerResolutionTrack/100)
      }
      // scenario 3: play has been pressed perfectly in time (pretty impossible)
      // example 5
      //    percentWithinGridClock = 30
      //    percentWithinGridTrack = 30
      if (percentWithinGridClock === percentWithinGridTrack) {
        console.log('ex 5', percentWithinGridClock, percentWithinGridTrack)
        targetSecondTrack = prevResolutionTrack + percentWithinGridClock * (secondsPerResolutionTrack/100)
      }

      // TODO: for some reaason we have to add a few miliseconds!?
      this.mainstorage.seekToSecond(deckIndex, parseFloat(targetSecondTrack) + 0.05)

      /*
      console.log('percentDistance', percentDistance)
      console.log('clock.secondsPerQuarterNote', this.clock.secondsPerQuarterNote)
      console.log('workingTempo', this.mainstorage.getWorkingTempo * this.mainstorage.decks[deckIndex].playbackRate)
      console.log('workingDownbeat', this.mainstorage.getWorkingDownbeat)
      console.log('deck.playbackRate', this.mainstorage.decks[deckIndex].playbackRate)
      console.log('clock.timestampLastQuarterNote', this.clock.timestampLastQuarterNote)
      console.log('distancePrevResolutionClock', distancePrevResolutionClock)
      console.log('distanceNextResolutionClock', distanceNextResolutionClock)
      console.log('negativeDownbeatTrack', negativeDownbeatTrack)
      console.log('trackDuration', trackDuration)
      console.log('prevResolutionTrack', prevResolutionTrack)
      console.log('nextResolutionTrack', nextResolutionTrack)
      console.log('distancePrevResolutionTrack', distancePrevResolutionTrack)
      console.log('distanceNextResolutionTrack', distanceNextResolutionTrack)
      console.log('percentWithinGridClock', percentWithinGridClock)
      console.log('percentWithinGridTrack', percentWithinGridTrack)
      console.log('targetSecondTrack', targetSecondTrack)
      */

      return 1
    }
  }
})

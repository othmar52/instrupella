import { defineStore } from 'pinia'
import { WebMidi } from 'webmidi'
import { useMainStore } from '@/store.js';

const DJ2GO2 = 'DJ2GO2'
const CONTROLHUB = 'CONTROL Hub'

const midiInputMainMappings = {
  [DJ2GO2]: {
    '16-noteon-6': 'g.loopFocus',
    '16-noteon-2': 'g.sniffAudioStartMidi',
    '16-noteoff-2': 'g.sniffAudioStop',
    '5-noteon-1': 'g.sniffRandomAudioStartMidi',
    '5-noteoff-1': 'g.sniffAudioStop',
    '16-noteon-3': 'd.0.loadTrackMidi',
    '16-controlchange-0': 'g.handleBrowseWheelRotate',
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
  },
  [CONTROLHUB]: {}
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
  },
  [CONTROLHUB]: {}
}
const addGuiElementClass = {
  [DJ2GO2]: {
    'd.0.loadTrack': 'invisible',
    'd.0.toBegin': 'invisible',
    'd.0.pitchSlider': 'slider-small',
    'd.0.volumeSlider': 'slider-small',
    'd.0.nudgeBehind': 'invisible',
    'd.0.nudgeAhead': 'invisible'
  },
  [CONTROLHUB]: {}
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
    midiInputClockPriority: [CONTROLHUB],
    midiOutputPriority: [DJ2GO2],
    midiInputMainMapping: null,
    midiOutputMapping: null,
    midiInputMainGuiElementClasses: null,
    guiAlerts: []
  }),
  getters: {
    getMidiInputPorts() {
      return this.midiInputPorts
    },
    getMidiOutputPorts() {
      return this.midiOutputPorts
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
      this.midiInputMainMapping = midiInputMainMappings[portIdentifier]
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
    midiOutputSetupCallback(portIdentifier) {
      this.midiOutputMapping = midiOutputMappings[portIdentifier]
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
    }
  }
})

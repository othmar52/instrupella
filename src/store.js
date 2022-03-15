import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useMainStore = defineStore({
  id: 'main',
  state: () => ({
    midiMappings: useStorage('midiMappings', []),
    midiLearn: useStorage('midiLearn', false),
    trackProps: useStorage('trackProps', [])
  }),
  getters: {
    getAllMidiMappings() {
      return this.midiMappings
    },
    midiMappingsEmpty() {
      return this.midiMappings.length <= 0
    },
    getMidiLearn() {
      return this.midiLearn <= 0
    },
    getAllTrackProps() {
      return this.trackProps
    }
  },
  actions: {
    addMidiMapping(midiMapping) {
      this.midiMappings.push(midiMapping);
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
    removeMidiMapping(index) {
      this.midiMappings.splice(index, 1)
    },
    toggleMidiLearn() {
      this.midiLearn = !this.midiLearn
      // console.log('store.toggleMidiLearn() to', this.midiLearn)
    }
  },
})

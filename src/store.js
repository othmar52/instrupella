import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useMainStore = defineStore({
    id: 'main',
    state: () => ({
        midiMappings: useStorage('midiMappings', []),
        midiLearn: useStorage('midiLearn', false)
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
        }
    },
    actions: {
        addMidiMapping(midiMapping) {
            this.midiMappings.push(midiMapping);
        },
        removeMidiMapping(index) {
            this.midiMappings.splice(index, 1)
        },
        toggleMidiLearn() {
            this.midiLearn = !this.midiLearn
            console.log('store.toggleMidiLearn() to', this.midiLearn)
        }

    },
})

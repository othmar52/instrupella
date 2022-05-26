<template>
  <div class="sync-control d-flex">
    <div class="sync-control-button-group d-flex flex-column">
      <Button
        label="÷2"
        :permaClasses="`${buttonClasses}`"
        :activeClass="deck.tempoFactorSync === 0.5 ? 'btn-primary' : ''"
        @click="toggleSyncTempoFactor(0.5)"
      />
      <Button
        label="×2"
        :permaClasses="`${buttonClasses}`"
        :activeClass="deck.tempoFactorSync === 2 ? 'btn-primary' : ''"
        @click="toggleSyncTempoFactor(2)"
      />
      <Button
        :label="syncResolutionLabel"
        :permaClasses="`${buttonClasses}`"
        :activeClass="deck.tempoFactorSync === 2 ? 'btn-primary' : ''"
        @click="storage.loopSyncResolution(deck.index)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from '@/components/Button.vue'
import { useMainStore } from "@/store.js";
import { useMidiStore } from "@/midistore.js";
const storage = useMainStore()
const midistorage = useMidiStore()
const buttonClasses = ref('btn btn-square btn-lg m-10 mr-0')



const toggleSyncTempoFactor = (factor) => {
  // console.log('toggleSyncTempo', factor)
  storage.loopTempoFactorSync(
    props.deck.index,
    factor === props.deck.tempoFactorSync ? 1 : factor
  )
  storage.syncTempoToExternalClock()
  midistorage.resyncDeck(props.deck.index)
}

const props = defineProps({
  deck: {
    type: Object,
    default: null
  },
  midiLearn: {
    type: Boolean,
    default: false
  }
})

const syncResolutionLabel = computed(() => {
  if (props.deck.syncResolution === 4) {
    return '4 bar'
  }
  if (props.deck.syncResolution === 0.25) {
    return '1/4'
  }
  if (props.deck.syncResolution === 0.5) {
    return '1/2'
  }
  return '1 bar'
})

</script>

<template>
  <span @click="storage.loopTempoFactor(deck.index)">
      <ColoredTempo
        :track="deck.track"
        :digits="digits"
        :playbackRate="deck.playbackRate"
        :tempoFactor="deck.tempoFactor"
        :showUnit="showUnit"
      />
     <span v-if="deck.tempoFactor === 0.5" class="text-muted">(half)</span>
     <span v-if="deck.tempoFactor === 2" class="text-muted">(double)</span>
  </span>
</template>

<script setup>
/**
 * adds a clickhandler to loop through normal, double, half tempo
 * this only changes the displayed bpm but not the actual playback speed
 */
import ColoredTempo from '@/components/ColoredTempo.vue'
import { useMainStore } from "@/store.js";
const storage = useMainStore()
const props = defineProps({
  deck: {
    type: Object
  },
  digits: {
    type: Number,
    default: 0
  },
  showUnit: {
    type: Boolean,
    default: false
  }
})

</script>

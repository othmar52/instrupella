<template>
  <div class="sync-control d-flex">
    <div class="sync-control-button-group d-flex flex-column">
      <Button
        label="÷2"
        :permaClasses="`${buttonClasses}`"
        :activeClass="deck.tempoFactorSync === 0.5 ? 'btn-primary' : ''"
        @click="storage.loopTempoFactorSync(deck.index, 0.5)"
      />
      <Button
        label="×1"
        :permaClasses="`${buttonClasses}`"
        :activeClass="deck.tempoFactorSync === 1 ? 'btn-primary' : ''"
        @click="storage.loopTempoFactorSync(deck.index, 1)"
      />
      <Button
        label="×2"
        :permaClasses="`${buttonClasses}`"
        :activeClass="deck.tempoFactorSync === 2 ? 'btn-primary' : ''"
        @click="storage.loopTempoFactorSync(deck.index, 2)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from '@/components/Button.vue'
import { useMainStore } from "@/store.js";
const storage = useMainStore()
const buttonClasses = ref('btn btn-square btn-lg m-10 mr-0')

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

</script>

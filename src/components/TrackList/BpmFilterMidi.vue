<template>
  <div class="bpm-filter-midi backdropped" v-show="bpmFilterVisible">
    <h5>
      <span class="text-muted">Tempo filter: </span>
      <span v-if="bpmFilter === 'none'">OFF</span>
      <span v-else>{{bpmFilter}} <span class="text-muted">BPM</span></span>
    </h5>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMainStore } from "@/store.js"
import { useMidiStore } from "@/midistore.js";
const storage = useMainStore()
const midistorage = useMidiStore()
const props = defineProps({
  bpmFilterValues: {
    type: Array,
    default: []
  }
})
const bpmFilterMidi = computed(() => storage.getBpmFilterMidi)
const bpmFilter = ref('none')
const bpmFilterVisible = ref(false)
let fireTimeout = null

watch(() => storage.getBpmFilterMidi, (newValue) => {
  bpmFilter.value = props.bpmFilterValues[newValue]
  bpmFilterVisible.value = true
  if (fireTimeout) {
    clearTimeout(fireTimeout)
  }
  fireTimeout = setTimeout(() => {
    // console.log('fire bpmFilterMidi', bpmFilter.value)
    bpmFilterVisible.value = false

    let targetBpm = parseInt(bpmFilter.value)
    if (bpmFilter.value === 'none') {
      targetBpm = null
    }
    if (bpmFilter.value === 'midi') {
      targetBpm = parseInt(midistorage.getExternalClockTempo)
    }
    emit('setBpmFilter', targetBpm)


  }, 1000)
})

const emit = defineEmits([
  'setBpmFilter'
])

</script>

<style lang="scss">
</style>